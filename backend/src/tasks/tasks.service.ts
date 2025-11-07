import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private ordersService: OrdersService) {}

  // Run every hour to clear unpaid orders
  @Cron(CronExpression.EVERY_HOUR)
  async handleClearUnpaidOrders() {
    this.logger.log('Running auto-clear unpaid orders task');

    try {
      await this.ordersService.clearUnpaidOrders();
      this.logger.log('Auto-clear unpaid orders task completed successfully');
    } catch (error) {
      this.logger.error('Error clearing unpaid orders:', error);
    }
  }
}
