import { Controller, Post, Body, Res, UploadedFile, UseInterceptors, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express'
import { PdfDTO } from './dto/pdf.dto';
import { Readable } from 'stream';
import { Response } from 'express';
import { QROptions } from './interfaces/QROptions';

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
    this.appService.printQR(pdf, body).then(pdfBytes => {
      const stream = new Readable();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBytes.length,
      });

      stream.push(pdfBytes);
      stream.push(null);
      stream.pipe(res);
    }).catch((error: Error) => {
      if (error.message.indexOf("encrypted") > -1)
        res.send({ error: `Input document to '${pdf.originalname}' is encrypted` })
      else
        res.send({ error: error.message })
    })

  }
}
