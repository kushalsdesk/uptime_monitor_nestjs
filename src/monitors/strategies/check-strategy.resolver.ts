import { Injectable, NotFoundException } from '@nestjs/common';
import { MonitorType } from '../entities/monitor.entity.js';
import { CheckStrategy } from './check-strategy.interface.js';
import { HttpCheckStrategy } from './http-check.strategy.js';
import { ApiCheckStrategy } from './api-check.strategy.js';
import { PingCheckStrategy } from './ping-check.strategy.js';

@Injectable()
export class CheckStrategyResolver {
  private readonly strategies = new Map<MonitorType, CheckStrategy>();

  constructor(
    httpCheckStrategy: HttpCheckStrategy,
    apiCheckStrategy: ApiCheckStrategy,
    pingCheckStrategy: PingCheckStrategy,
  ) {
    this.strategies.set(httpCheckStrategy.type, httpCheckStrategy);
    this.strategies.set(apiCheckStrategy.type, apiCheckStrategy);
    this.strategies.set(pingCheckStrategy.type, pingCheckStrategy);
  }

  /**
   * Resolves the concrete strategy for a given MonitorType in O(1) time
   * without using messy switch or if/else branches.
   */
  resolve(type: MonitorType): CheckStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new NotFoundException(`No check strategy registered for monitor type: ${type}`);
    }
    return strategy;
  }
}
