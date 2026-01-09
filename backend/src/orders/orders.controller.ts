import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Delete,
  Put,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatusLookupDto } from './dto/order-status-lookup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, OrderStatus, PaymentStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { SearchOrdersDto } from './dto/search-orders.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public endpoint - customer creates order
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60 } })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user?: any,
  ) {
    if (user && ![UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF].includes(user.role)) {
      throw new ForbiddenException('Unauthorized to create orders as staff');
    }
    return this.ordersService.create(createOrderDto, user?.id);
  }

  // Public endpoint - get order by order number
  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  // Public endpoint - get orders by phone
  @Get('customer/:phone')
  getOrdersByPhone(@Param('phone') phone: string) {
    return this.ordersService.getOrdersByCustomerPhone(phone);
  }

  // Public endpoint - check status by table number and phone
  @Post('status-lookup')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  lookupStatus(@Body() body: OrderStatusLookupDto) {
    return this.ordersService.lookupStatus(body.orderNumber, body.phone);
  }

  // Public endpoint - clear table for completed orders
  @Post('clear-table')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60 } })
  clearTable(@Body() body: OrderStatusLookupDto) {
    return this.ordersService.clearTable(body.orderNumber, body.phone);
  }

  // Staff/Admin - get all orders with filters
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(
    @Query('status') status?: OrderStatus,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
  ) {
    return this.ordersService.findAll(status, paymentStatus);
  }

  // Staff/Admin - search orders for POS by phone or order number
  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  searchOrders(@Query() query: SearchOrdersDto) {
    return this.ordersService.searchOrders(query.phone, query.orderNumber);
  }

  // Kitchen - get kitchen orders
  @Get('kitchen')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN)
  getKitchenOrders() {
    return this.ordersService.getKitchenOrders();
  }

  // Kitchen - get kitchen statistics
  @Get('kitchen/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN)
  getKitchenStats() {
    return this.ordersService.getKitchenStats();
  }

  // Staff/Admin - get order stats
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  // Staff/Admin - get analytics data
  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  getAnalytics() {
    return this.ordersService.getAnalytics();
  }

  // Admin - get all customers
  @Get('customers/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllCustomers() {
    return this.ordersService.getAllCustomers();
  }

  // Admin - export customers as CSV
  @Get('customers/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async exportCustomers(@Res() res: Response) {
    const csv = await this.ordersService.exportCustomersCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    res.send(csv);
  }

  // Admin - delete customer and their orders
  @Delete('customers/:phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCustomer(@Param('phone') phone: string) {
    return this.ordersService.deleteCustomerByPhone(phone);
  }

  // Get single order
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // Staff/Admin - update order details
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  // Staff/Admin/Kitchen - update order status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.KITCHEN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user.id);
  }

  // Staff/Admin - mark order as paid
  @Patch(':id/mark-paid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  markAsPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.markAsPaid(id, user.id);
  }

  // Staff/Admin - cancel order
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  // Staff/Admin - approve order
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  approveOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.approveOrder(id, user.id);
  }

  // Staff/Admin - reject order
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  rejectOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.rejectOrder(id, user.id);
  }
}
