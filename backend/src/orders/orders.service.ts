import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentStatus, MenuCategory } from '@prisma/client';
import { OrdersGateway } from './orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    // Validate menu items and calculate total
    let totalAmount = 0;
    const orderItems: Array<{
      menuItemId: string;
      quantity: number;
      unitPrice: any;
      subtotal: number;
      notes?: string;
    }> = [];
    let isCakeOrder = false;

    for (const item of createOrderDto.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }

      if (!menuItem.isAvailable) {
        throw new BadRequestException(`${menuItem.name} is not available`);
      }

      // Check if it's a cake order
      if (menuItem.category === MenuCategory.CAKES) {
        isCakeOrder = true;
      }

      // Check stock for cabinet food
      if (menuItem.category === MenuCategory.CABINET_FOOD) {
        if (!menuItem.stockQty || menuItem.stockQty < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${menuItem.name}`);
        }
      }

      const subtotal = Number(menuItem.price) * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal,
        notes: item.notes,
      });
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        language: createOrderDto.language,
        tableId: createOrderDto.tableId,
        notes: createOrderDto.notes,
        totalAmount,
        isCakeOrder,
        cakePickupDate: createOrderDto.cakePickupDate,
        cakeNotes: createOrderDto.cakeNotes,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        ...(isCakeOrder && {
          downPaymentAmount: totalAmount * 0.5, // 50% down payment
          downPaymentDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 working days
        }),
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

    // Update stock for cabinet food
    for (const item of createOrderDto.items) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (menuItem?.category === MenuCategory.CABINET_FOOD && menuItem.stockQty) {
        await this.prisma.menuItem.update({
          where: { id: item.menuItemId },
          data: {
            stockQty: menuItem.stockQty - item.quantity,
            isAvailable: menuItem.stockQty - item.quantity > 0,
          },
        });
      }
    }

    // Emit WebSocket event
    this.ordersGateway.emitOrderCreated(order);

    return order;
  }

  async findAll(status?: OrderStatus, paymentStatus?: PaymentStatus) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        staff: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        staff: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, staffId?: string) {
    const order = await this.findOne(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderStatusDto.status,
        ...(updateOrderStatusDto.status === OrderStatus.COMPLETED && {
          completedAt: new Date(),
        }),
        ...(staffId && { staffId }),
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

    // Emit WebSocket event
    this.ordersGateway.emitOrderStatusChanged(updatedOrder);

    return updatedOrder;
  }

  async markAsPaid(id: string, staffId: string) {
    const order = await this.findOne(id);

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
        status: OrderStatus.WAITING, // Move to waiting after payment
        staffId,
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
    });

    // Emit WebSocket event
    this.ordersGateway.emitOrderPaymentUpdated(updatedOrder);

    return updatedOrder;
  }

  async getKitchenOrders() {
    return this.prisma.order.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        status: {
          in: [OrderStatus.WAITING, OrderStatus.COOKING],
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOrdersByCustomerPhone(phone: string) {
    return this.prisma.order.findMany({
      where: { customerPhone: phone },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelOrder(id: string) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid order. Please process refund first.');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  }

  async getOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await this.prisma.order.count({
      where: {
        createdAt: { gte: today },
      },
    });

    const todayRevenue = await this.prisma.order.aggregate({
      where: {
        createdAt: { gte: today },
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const pendingOrders = await this.prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    });

    const activeOrders = await this.prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.WAITING, OrderStatus.COOKING],
        },
      },
    });

    return {
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      pendingOrders,
      activeOrders,
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `ORD-${dateStr}`,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `ORD-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  // Auto-clear unpaid orders (to be called by cron job)
  async clearUnpaidOrders() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Clear non-cake unpaid orders after 1 hour
    await this.prisma.order.updateMany({
      where: {
        isCakeOrder: false,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: { lt: oneHourAgo },
        autoCleared: false,
      },
      data: {
        status: OrderStatus.CANCELLED,
        autoCleared: true,
        autoClearedAt: new Date(),
      },
    });

    // Clear cake orders with no payment after 2 working days
    await this.prisma.order.updateMany({
      where: {
        isCakeOrder: true,
        paymentStatus: PaymentStatus.PENDING,
        downPaymentDueDate: { lt: twoDaysAgo },
        autoCleared: false,
      },
      data: {
        status: OrderStatus.CANCELLED,
        autoCleared: true,
        autoClearedAt: new Date(),
      },
    });
  }
}
