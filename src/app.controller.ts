import { Controller, Post, Body, Res, UploadedFile, UseInterceptors, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express'
import { PdfDTO } from './dto/pdf.dto';
import { Readable } from 'stream';
import { Response } from 'express';
import { Point, QROptions } from './interfaces/QROptions';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }


  @Post()
  @UseInterceptors(
    FileInterceptor("pdf", {
      dest: "./assets/cache",
      limits: {
        fileSize: 50000000
      }
    })
  )
  async postPdf(@UploadedFile() pdf: PdfDTO, @Body() body: QROptions, @Res() res: Response) {
    const pdfBytes = await this.appService.printQR(pdf, body);
    const stream = new Readable();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBytes.length,
    });

    stream.push(pdfBytes);
    stream.push(null);
    stream.pipe(res);
  }
}
