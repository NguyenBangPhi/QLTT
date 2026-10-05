import { Controller, Get, Put, Post, Param, Query, ParseIntPipe, UseGuards, Request, ForbiddenException, UseInterceptors, UploadedFile, StreamableFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Hệ thống & Cronjob')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Roles('Admin')
  @ApiOperation({ summary: 'Xem log hệ thống' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('logs')
  getLogs(@Query('page', new ParseIntPipe({ optional: true })) page?: number, 
          @Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.systemService.getLogs(page || 1, limit || 50);
  }

  @Roles('Sinh viên')
  @ApiOperation({ summary: 'Xem thông báo' })
  @Get('notifications')
  getNotifications(@Request() req: any) {
    if (req.user.role !== 'Sinh viên' || !req.user.maSV) {
      throw new ForbiddenException('Chỉ sinh viên mới có thông báo cá nhân');
    }
    return this.systemService.getNotifications(req.user.maSV);
  }

  @Roles('Sinh viên')
  @ApiOperation({ summary: 'Đánh dấu đọc thông báo' })
  @Put('notifications/:id/read')
  markNotificationRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.systemService.markNotificationRead(id, req.user.maSV);
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Chạy thủ công sp_LockOverdueAccounts' })
  @Post('system/lock-overdue')
  lockOverdueAccounts() {
    return this.systemService.lockOverdueAccounts();
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Chạy thủ công sp_SendReminder' })
  @Post('system/send-reminders')
  sendReminders() {
    return this.systemService.sendReminders();
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Backup dữ liệu' })
  @Post('system/backup')
  async backup(@Res({ passthrough: true }) res: Response) {
    const backupContent = await this.systemService.backupDatabase();
    res.set({
      'Content-Type': 'application/sql',
      'Content-Disposition': 'attachment; filename="backup.sql"',
    });
    return new StreamableFile(Buffer.from(backupContent));
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Restore dữ liệu' })
  @Post('system/restore')
  @UseInterceptors(FileInterceptor('file'))
  restore(@UploadedFile() file: any) {
    if (!file) throw new ForbiddenException('Vui lòng upload file .sql');
    return this.systemService.restoreDatabase(file);
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Export dữ liệu' })
  @Post('system/export')
  async export(@Res({ passthrough: true }) res: Response) {
    const buffer = await this.systemService.exportData();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="export.xlsx"',
    });
    return new StreamableFile(Buffer.from(buffer));
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Import dữ liệu' })
  @Post('system/import')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: any) {
    if (!file) throw new ForbiddenException('Vui lòng upload file .xlsx');
    return this.systemService.importData(file);
  }
}
