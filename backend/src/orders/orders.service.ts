import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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

      // Resolve unit price (size-specific if provided)
      let unitPrice = Number(menuItem.price);
      if (item.sizeLabel && Array.isArray(menuItem.sizes)) {
        const matchedSize = (menuItem.sizes as any[]).find((s) => s.label === item.sizeLabel);
        if (!matchedSize) {
          throw new BadRequestException(`Size ${item.sizeLabel} not available for ${menuItem.name}`);
        }
        unitPrice = Number(matchedSize.price);
      }

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        notes: item.notes,
        ...(item.sizeLabel ? { sizeLabel: item.sizeLabel } : {}),
      });
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Get settings to check order approval mode
    const settings = await this.prisma.settings.findFirst();
    const requiresApproval = settings?.orderApprovalMode === 'REQUIRES_APPROVAL';

    // Determine initial order status based on approval mode
    const initialStatus = requiresApproval ? OrderStatus.PENDING_APPROVAL : OrderStatus.WAITING;

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
        status: initialStatus, // PENDING_APPROVAL if requires approval, else WAITING
        paymentStatus: PaymentStatus.PENDING, // Payment confirmed later
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

  async lookupStatus(orderNumber: string, phone: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        customerPhone: phone,
        tableCleared: false,
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!order) {
      throw new NotFoundException('No active order found for this table/phone combination');
    }

    return order;
  }

  async clearTable(orderNumber: string, phone: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        customerPhone: phone,
        status: {
          in: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
        },
        tableCleared: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!order) {
      throw new NotFoundException('No completed or closed order found to clear for this table/phone');
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        tableCleared: true,
        tableClearedAt: new Date(),
        tableId: null,
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

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    // Check if order can be edited (only before cooking starts)
    const editableStatuses: OrderStatus[] = [
      OrderStatus.PENDING_APPROVAL,
      OrderStatus.APPROVED,
      OrderStatus.WAITING,
      OrderStatus.PENDING,
      OrderStatus.PAID,
    ];

    if (!editableStatuses.includes(order.status)) {
      throw new BadRequestException('Cannot edit order after cooking has started or if order is completed/cancelled/rejected');
    }

    // Additional check: if order is COOKING, also prevent editing
    if (order.status === OrderStatus.COOKING) {
      throw new BadRequestException('Cannot edit order once cooking has started');
    }

    // If items are being updated, recalculate total
    let totalAmount = Number(order.totalAmount);
    let isCakeOrder = order.isCakeOrder;

    if (updateOrderDto.items) {
      totalAmount = 0;
      isCakeOrder = false;
      const orderItems: Array<{
        menuItemId: string;
        quantity: number;
        unitPrice: any;
        subtotal: number;
        notes?: string;
        sizeLabel?: string;
      }> = [];

      for (const item of updateOrderDto.items) {
        const itemQuantity = item.quantity || 1;

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
          if (!menuItem.stockQty || menuItem.stockQty < itemQuantity) {
            throw new BadRequestException(`Insufficient stock for ${menuItem.name}`);
          }
        }

        let unitPrice = Number(menuItem.price);

        if (item.sizeLabel && Array.isArray(menuItem.sizes)) {
          const matchedSize = (menuItem.sizes as any[]).find((s) => s.label === item.sizeLabel);
          if (!matchedSize) {
            throw new BadRequestException(`Size ${item.sizeLabel} not available for ${menuItem.name}`);
          }
          unitPrice = Number(matchedSize.price);
        }

        const subtotal = unitPrice * itemQuantity;
        totalAmount += subtotal;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: itemQuantity,
          unitPrice,
          subtotal,
          notes: item.notes,
          ...(item.sizeLabel ? { sizeLabel: item.sizeLabel } : {}),
        });
      }

      // Delete existing order items and create new ones
      await this.prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      await this.prisma.orderItem.createMany({
        data: orderItems.map(item => ({
          ...item,
          orderId: id,
        })),
      });
    }

    // Update order
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...(updateOrderDto.customerName && { customerName: updateOrderDto.customerName }),
        ...(updateOrderDto.customerPhone && { customerPhone: updateOrderDto.customerPhone }),
        ...(updateOrderDto.tableId && { tableId: updateOrderDto.tableId }),
        ...(updateOrderDto.notes !== undefined && { notes: updateOrderDto.notes }),
        ...(updateOrderDto.items && { totalAmount, isCakeOrder }),
        ...(updateOrderDto.cakePickupDate && { cakePickupDate: updateOrderDto.cakePickupDate }),
        ...(updateOrderDto.cakeNotes !== undefined && { cakeNotes: updateOrderDto.cakeNotes }),
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

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, staffId?: string) {
    const order = await this.findOne(id);
    const now = new Date();
    const createdAt = new Date(order.createdAt);

    // Calculate durations based on status change
    const updateData: any = {
      status: updateOrderStatusDto.status,
      ...(staffId && { staffId }),
    };

    // When order starts cooking
    if (updateOrderStatusDto.status === OrderStatus.COOKING && !order.cookingStartedAt) {
      updateData.cookingStartedAt = now;
      // Calculate preparation duration (time from creation to cooking started) in minutes
      updateData.preparationDuration = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
    }

    // When order is completed
    if (updateOrderStatusDto.status === OrderStatus.COMPLETED) {
      updateData.completedAt = now;

      // Calculate total duration (time from creation to completion) in minutes
      updateData.totalDuration = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

      // Calculate cooking duration if cookingStartedAt exists
      if (order.cookingStartedAt) {
        const cookingStartedAt = new Date(order.cookingStartedAt);
        updateData.cookingDuration = Math.floor((now.getTime() - cookingStartedAt.getTime()) / 60000);
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
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
        // Don't change status - order is already in kitchen (WAITING or COOKING)
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
    // Get settings to check order approval mode
    const settings = await this.prisma.settings.findFirst();
    const requiresApproval = settings?.orderApprovalMode === 'REQUIRES_APPROVAL';

    // Define which statuses should be shown in kitchen
    let kitchenStatuses: OrderStatus[] = [OrderStatus.WAITING, OrderStatus.COOKING];

    // If approval mode is enabled, also show APPROVED orders
    // (they will move to WAITING when staff approves)
    if (requiresApproval) {
      kitchenStatuses = [OrderStatus.APPROVED, OrderStatus.WAITING, OrderStatus.COOKING];
    }

    // Show orders in kitchen based on status
    return this.prisma.order.findMany({
      where: {
        status: {
          in: kitchenStatuses,
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

  async approveOrder(id: string, staffId?: string) {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval orders can be approved');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.WAITING, // Move to kitchen queue
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

  async rejectOrder(id: string, staffId?: string) {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval orders can be rejected');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.REJECTED,
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

    const pendingPaymentOrders = await this.prisma.order.count({
      where: {
        paymentStatus: PaymentStatus.PENDING,
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
      pendingOrders: pendingPaymentOrders, // Orders with pending payment
      activeOrders,
    };
  }

  async getAllCustomers() {
    // Get unique customers from orders
    const orders = await this.prisma.order.findMany({
      select: {
        customerName: true,
        customerPhone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by phone number to get unique customers with their details
    const customersMap = new Map();

    orders.forEach(order => {
      if (!customersMap.has(order.customerPhone)) {
        customersMap.set(order.customerPhone, {
          name: order.customerName,
          phone: order.customerPhone,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
          orderCount: 1,
        });
      } else {
        const customer = customersMap.get(order.customerPhone);
        customer.orderCount += 1;
        if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.createdAt;
          // Update name if more recent (in case customer changed their name)
          customer.name = order.customerName;
        }
        if (new Date(order.createdAt) < new Date(customer.firstOrderDate)) {
          customer.firstOrderDate = order.createdAt;
        }
      }
    });

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      Array.from(customersMap.values()).map(async (customer) => {
        const totalSpent = await this.prisma.order.aggregate({
          where: {
            customerPhone: customer.phone,
            paymentStatus: PaymentStatus.PAID,
          },
          _sum: {
            totalAmount: true,
          },
        });

        return {
          ...customer,
          totalSpent: totalSpent._sum.totalAmount || 0,
        };
      })
    );

    return customersWithStats.sort((a, b) =>
      new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  }

  async deleteCustomerByPhone(phone: string) {
    const existing = await this.prisma.order.count({
      where: { customerPhone: phone },
    });

    if (existing === 0) {
      throw new NotFoundException(`No customer found with phone ${phone}`);
    }

    const deletedOrders = await this.prisma.order.deleteMany({
      where: { customerPhone: phone },
    });

    return { deletedOrders: deletedOrders.count };
  }

  async exportCustomersCsv() {
    const customers = await this.getAllCustomers();

    const header = ['Name', 'Phone', 'First Order', 'Last Order', 'Total Orders', 'Total Spent'];
    const rows = customers.map((c) => [
      c.name,
      c.phone,
      new Date(c.firstOrderDate).toISOString(),
      new Date(c.lastOrderDate).toISOString(),
      c.orderCount.toString(),
      c.totalSpent.toString(),
    ]);

    const escape = (value: string) => {
      const shouldQuote = value.includes(',') || value.includes('"') || value.includes('\n');
      const escaped = value.replace(/"/g, '""');
      return shouldQuote ? `"${escaped}"` : escaped;
    };

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => escape(cell)).join(','))
      .join('\n');

    return csv;
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
    // Get settings for auto-clear thresholds
    const settings = await this.prisma.settings.findFirst();

    const normalOrderHours = settings?.normalOrderClearHours || 1;
    const cakeOrderDays = settings?.cakeOrderClearDays || 2;
    const unapprovedMinutes = settings?.autoClearUnapprovedMinutes || 30;

    const normalOrderClearTime = new Date(Date.now() - Number(normalOrderHours) * 60 * 60 * 1000);
    const cakeOrderClearTime = new Date(Date.now() - cakeOrderDays * 24 * 60 * 60 * 1000);
    const unapprovedClearTime = new Date(Date.now() - unapprovedMinutes * 60 * 1000);

    // Clear unapproved orders after specified minutes
    await this.prisma.order.updateMany({
      where: {
        status: OrderStatus.PENDING_APPROVAL,
        createdAt: { lt: unapprovedClearTime },
        autoCleared: false,
      },
      data: {
        status: OrderStatus.CANCELLED,
        autoCleared: true,
        autoClearedAt: new Date(),
      },
    });

    // Clear non-cake unpaid orders after configured hours
    await this.prisma.order.updateMany({
      where: {
        isCakeOrder: false,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: { lt: normalOrderClearTime },
        autoCleared: false,
      },
      data: {
        status: OrderStatus.CANCELLED,
        autoCleared: true,
        autoClearedAt: new Date(),
      },
    });

    // Clear cake orders with no payment after configured days
    await this.prisma.order.updateMany({
      where: {
        isCakeOrder: true,
        paymentStatus: PaymentStatus.PENDING,
        downPaymentDueDate: { lt: cakeOrderClearTime },
        autoCleared: false,
      },
      data: {
        status: OrderStatus.CANCELLED,
        autoCleared: true,
        autoClearedAt: new Date(),
      },
    });
  }

  // Get kitchen statistics
  async getKitchenStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Orders completed today
    const ordersCompletedToday = await this.prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: { gte: today },
      },
    });

    // Orders completed this month
    const ordersCompletedThisMonth = await this.prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: { gte: thisMonthStart },
      },
    });

    // Orders completed last month
    const ordersCompletedLastMonth = await this.prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    // Average cooking time (only for orders with cooking duration)
    const avgCookingTime = await this.prisma.order.aggregate({
      where: {
        status: OrderStatus.COMPLETED,
        cookingDuration: { not: null },
      },
      _avg: {
        cookingDuration: true,
      },
    });

    // Average preparation/waiting time
    const avgWaitingTime = await this.prisma.order.aggregate({
      where: {
        status: OrderStatus.COMPLETED,
        preparationDuration: { not: null },
      },
      _avg: {
        preparationDuration: true,
      },
    });

    return {
      ordersCompletedToday,
      ordersCompletedThisMonth,
      ordersCompletedLastMonth,
      avgCookingTime: Math.round(avgCookingTime._avg.cookingDuration || 0),
      avgWaitingTime: Math.round(avgWaitingTime._avg.preparationDuration || 0),
    };
  }

  // Get analytics data
  async getAnalytics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all completed and paid orders
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      },
      include: {
        table: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Table usage stats
    const tableUsage = new Map<string, number>();
    orders.forEach(order => {
      if (order.table) {
        const tableNumber = order.table.tableNumber;
        tableUsage.set(tableNumber, (tableUsage.get(tableNumber) || 0) + 1);
      }
    });

    const tableUsageArray = Array.from(tableUsage.entries())
      .map(([tableNumber, count]) => ({ tableNumber, count }))
      .sort((a, b) => b.count - a.count);

    // Busiest time of day (hourly distribution)
    const hourlyOrders = new Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyOrders[hour]++;
    });

    const busiestHours = hourlyOrders
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average cooking time
    const ordersWithCookingTime = orders.filter(o => o.cookingDuration);
    const avgCookingTime = ordersWithCookingTime.length > 0
      ? ordersWithCookingTime.reduce((sum, o) => sum + (o.cookingDuration || 0), 0) / ordersWithCookingTime.length
      : 0;

    return {
      totalRevenue,
      avgOrderValue,
      totalOrders: orders.length,
      tableUsage: tableUsageArray,
      busiestHours,
      avgCookingTime: Math.round(avgCookingTime),
    };
  }
}
