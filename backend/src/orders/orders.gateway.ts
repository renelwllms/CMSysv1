import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('OrdersGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized on namespace: /');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Emit order created event
  emitOrderCreated(order: any) {
    this.server.emit('order:created', order);
    this.logger.log(`Order created event emitted: ${order.orderNumber}`);
  }

  // Emit order updated event
  emitOrderUpdated(order: any) {
    this.server.emit('order:updated', order);
    this.logger.log(`Order updated event emitted: ${order.orderNumber}`);
  }

  // Emit order status changed event
  emitOrderStatusChanged(order: any) {
    this.server.emit('order:statusChanged', order);
    this.logger.log(`Order status changed event emitted: ${order.orderNumber}`);
  }

  // Emit order payment updated event
  emitOrderPaymentUpdated(order: any) {
    this.server.emit('order:paymentUpdated', order);
    this.logger.log(`Order payment updated event emitted: ${order.orderNumber}`);
  }

  // Emit order deleted event
  emitOrderDeleted(orderId: string) {
    this.server.emit('order:deleted', orderId);
    this.logger.log(`Order deleted event emitted: ${orderId}`);
  }
}
