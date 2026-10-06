import { Controller, Get, Put, Post, Param, Query, ParseIntPipe, UseGuards, Request, ForbiddenException, BadRequestException, UseInterceptors, UploadedFile, StreamableFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const FILE_UPLOAD_BODY = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: { file: { type: 'string', format: 'binary' } },
  },
};

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

  private requireFile(file: Express.Multer.File | undefined, extension: string) {
    if (!file) throw new BadRequestException(`Vui lòng chọn file ${extension}.`);
    if (!file.originalname.toLowerCase().endsWith(extension)) {
      throw new BadRequestException(`File phải có phần mở rộng ${extension}.`);
    }
    if (!file.size) throw new BadRequestException('File rỗng.');
    return file;
  }

  @Roles('Admin')
  @ApiOperation({ summary: 'Sao lưu database ra file .sql' })
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
  @ApiOperation({
    summary: 'Phục hồi database từ file .sql',
    description: 'Ghi đè dữ liệu hiện có. Nên xác nhận lại với người dùng trước khi gọi.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_BODY)
  @Post('system/restore')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  restore(@UploadedFile() file?: Express.Multer.File) {
    return this.systemService.restoreDatabase(this.requireFile(file, '.sql'));
  }

  @Roles('Admin')
  @ApiOperation({
    summary: 'Xuất dữ liệu ra file .xlsx',
    description:
      'Hai sheet: TheLoai và Sach. Sheet Sach kèm TenTacGia, TenTheLoai để nhập lại khớp ' +
      'được khoá ngoại theo tên.',
  })
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
  @ApiOperation({
    summary: 'Nhập thể loại và sách từ file .xlsx',
    description:
      'Đọc sheet "TheLoai" rồi tới "Sach", chỉ thêm mới chứ không ghi đè. Sách đi qua ' +
      'sp_AddBook. Trả về kết quả từng sheet kèm lý do của tối đa 20 dòng bị bỏ qua.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody(FILE_UPLOAD_BODY)
  @Post('system/import')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  import(@UploadedFile() file?: Express.Multer.File) {
    return this.systemService.importData(this.requireFile(file, '.xlsx'));
  }
}
