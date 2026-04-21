import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StudentsModel } from '../../models/students.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as QRCode from 'qrcode';
import { Title } from '@angular/platform-browser';
import { SystemSettingsService } from 'src/app/system/services/system-settings.service';

@Component({
  selector: 'app-student-id-card',
  templateUrl: './student-id-card.component.html',
  styleUrls: ['./student-id-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentIdCardComponent implements OnInit, OnDestroy {
  student!: StudentsModel;
  qrCodeDataUrl: SafeUrl = '';
  isLoading = true;
  currentDate = new Date();
  schoolName = 'School';
  schoolAddress = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: StudentsModel,
    private dialogRef: MatDialogRef<StudentIdCardComponent>,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private systemSettings: SystemSettingsService
  ) {
    this.student = data;
  }

  ngOnInit(): void {
    this.title.setTitle(`Student ID Card - ${this.student.name} ${this.student.surname}`);
    this.systemSettings.getSettings().subscribe(settings => {
      this.schoolName = settings.schoolName ?? 'School';
      this.schoolAddress = settings.schoolAddress ?? '';
      this.cdr.markForCheck();
      this.generateQRCode();
    }, () => {
      this.generateQRCode();
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private async generateQRCode(): Promise<void> {
    try {
      // Create QR code data with student information
      const qrData = {
        studentNumber: this.student.studentNumber,
        name: `${this.student.name} ${this.student.surname}`,
        idNumber: this.student.idnumber,
        school: this.schoolName,
        url: `${window.location.origin}/student-view/${this.student.studentNumber}`
      };

      console.log('Generating QR code with data:', qrData);

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      console.log('QR code generated successfully, length:', qrCodeDataUrl.length);
      this.qrCodeDataUrl = qrCodeDataUrl;
      this.isLoading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Create a fallback placeholder
      this.qrCodeDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPFFSIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  printIDCard(): void {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const qrCodeImg = this.qrCodeDataUrl.toString();
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Student ID Card - ${this.student.name} ${this.student.surname}</title>
          <style>
            @page {
              size: 3.375in 2.125in;
              margin: 0;
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif; 
              background: white;
            }
            .id-card-container { 
              width: 3.375in; 
              height: 2.125in; 
              border: 2px solid #333; 
              border-radius: 10px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
            }
            .id-card-content { 
              padding: 12px; 
              height: calc(100% - 24px); 
              display: flex; 
              flex-direction: column; 
              justify-content: space-between;
              box-sizing: border-box;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid rgba(255,255,255,0.3); 
              padding-bottom: 8px; 
              margin-bottom: 8px;
            }
            .school-name { 
              font-size: 12px; 
              font-weight: bold; 
              margin: 0; 
              letter-spacing: 1px;
            }
            .school-subtitle {
              font-size: 8px;
              margin: 2px 0 0 0;
              opacity: 0.9;
            }
            .student-info { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              flex: 1;
              gap: 10px;
            }
            .student-details { 
              flex: 1; 
            }
            .student-name { 
              font-size: 14px; 
              font-weight: bold; 
              margin: 0 0 4px 0; 
              line-height: 1.2;
            }
            .student-number { 
              font-size: 9px; 
              margin: 2px 0; 
              opacity: 0.9; 
              font-weight: 600;
              color: #ffd700;
            }
            .student-id { 
              font-size: 9px; 
              margin: 2px 0; 
              opacity: 0.9; 
            }
            .student-gender {
              font-size: 9px;
              margin: 2px 0;
              opacity: 0.9;
            }
            .student-class {
              font-size: 9px;
              margin: 2px 0;
              opacity: 0.9;
            }
            .qr-section { 
              text-align: center; 
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-code { 
              width: 60px; 
              height: 60px; 
              border: 2px solid white; 
              border-radius: 8px; 
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code img { 
              width: 100%; 
              height: 100%; 
              object-fit: contain; 
            }
            .qr-label {
              font-size: 7px;
              margin: 4px 0 0 0;
              opacity: 0.8;
            }
            .footer { 
              text-align: center; 
              font-size: 8px; 
              opacity: 0.8; 
              margin-top: 8px;
              border-top: 1px solid rgba(255,255,255,0.3);
              padding-top: 6px;
            }
            .valid-until { 
              font-size: 7px; 
              margin: 0 0 2px 0; 
              font-weight: 600;
            }
            .school-address {
              font-size: 6px;
              margin: 0;
              opacity: 0.7;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .id-card-container { 
                width: 3.375in; 
                height: 2.125in; 
                margin: 0; 
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="id-card-container">
            <div class="id-card-content">
              <div class="header">
                <h2 class="school-name">${(this.schoolName || 'School').toUpperCase()}</h2>
                <p class="school-subtitle">Student Identification Card</p>
              </div>
              <div class="student-info">
                <div class="student-details">
                  <h3 class="student-name">${this.student.name} ${this.student.surname}</h3>
                  <p class="student-number">Student ID: ${this.student.studentNumber}</p>
                  <p class="student-id">ID Number: ${this.student.idnumber}</p>
                  <p class="student-gender">Gender: ${this.student.gender}</p>
                  <p class="student-class">Class: Grade 8</p>
                </div>
                <div class="qr-section">
                  <div class="qr-code">
                    <img src="${qrCodeImg}" alt="QR Code">
                  </div>
                  <p class="qr-label">Scan for details</p>
                </div>
              </div>
              <div class="footer">
                <p class="valid-until">Valid until: ${(this.currentDate.getFullYear() + 1)}/${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}/${this.currentDate.getDate().toString().padStart(2, '0')}</p>
                <p class="school-address">${this.schoolAddress || ''}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for the content to load, then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    }
  }

  async downloadIDCard(): Promise<void> {
    try {
      // Try to use html2canvas for image generation
      const html2canvas = (await import('html2canvas')).default;
      const printContent = document.getElementById('id-card-content');
      
      if (printContent && html2canvas) {
        // Set up the canvas with proper dimensions (3.375" x 2.125" at 300 DPI)
        const dpi = 300;
        const width = 3.375 * dpi;
        const height = 2.125 * dpi;
        
        // Create a temporary container with the ID card
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '-9999px';
        tempContainer.style.width = '3.375in';
        tempContainer.style.height = '2.125in';
        tempContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        tempContainer.style.border = '2px solid #333';
        tempContainer.style.borderRadius = '10px';
        tempContainer.style.color = 'white';
        tempContainer.style.padding = '12px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.style.fontSize = '12px';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.overflow = 'hidden';
        tempContainer.style.display = 'flex';
        tempContainer.style.flexDirection = 'column';
        tempContainer.style.justifyContent = 'space-between';
        
        // Add the ID card content
        tempContainer.innerHTML = `
          <div style="text-align: center; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 8px; margin-bottom: 8px;">
            <h2 style="font-size: 12px; font-weight: bold; margin: 0; letter-spacing: 1px;">${(this.schoolName || 'School').toUpperCase()}</h2>
            <p style="font-size: 8px; margin: 2px 0 0 0; opacity: 0.9;">Student Identification Card</p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex: 1; gap: 10px;">
            <div style="flex: 1;">
              <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 4px 0; line-height: 1.2;">${this.student.name} ${this.student.surname}</h3>
              <p style="font-size: 9px; margin: 2px 0; opacity: 0.9; font-weight: 600; color: #ffd700;">Student ID: ${this.student.studentNumber}</p>
              <p style="font-size: 9px; margin: 2px 0; opacity: 0.9;">ID Number: ${this.student.idnumber || 'N/A'}</p>
              <p style="font-size: 9px; margin: 2px 0; opacity: 0.9;">Gender: ${this.student.gender}</p>
              <p style="font-size: 9px; margin: 2px 0; opacity: 0.9;">Class: Grade 8</p>
            </div>
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
              <div style="width: 60px; height: 60px; border: 2px solid white; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="${this.qrCodeDataUrl}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain; display: block;" onload="console.log('QR Code loaded successfully')" onerror="console.error('QR Code failed to load')">
              </div>
              <p style="font-size: 7px; margin: 4px 0 0 0; opacity: 0.8;">Scan for details</p>
            </div>
          </div>
          <div style="text-align: center; font-size: 8px; opacity: 0.8; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 6px;">
            <p style="font-size: 7px; margin: 0 0 2px 0; font-weight: 600;">Valid until: ${(this.currentDate.getFullYear() + 1)}/${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}/${this.currentDate.getDate().toString().padStart(2, '0')}</p>
            <p style="font-size: 6px; margin: 0; opacity: 0.7;">${this.schoolAddress || ''}</p>
          </div>
        `;
        
        document.body.appendChild(tempContainer);
        
        // Wait for QR code to load
        await new Promise(resolve => {
          const img = tempContainer.querySelector('img');
          if (img) {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true); // Continue even if QR code fails
            }
          } else {
            resolve(true);
          }
        });
        
        // Additional wait for rendering
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Capture the content as canvas
        const canvas = await html2canvas(tempContainer, {
          width: width,
          height: height,
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false
        });
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `student-id-card-${this.student.studentNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 'image/png', 0.95);
        
        // Clean up
        document.body.removeChild(tempContainer);
        
      } else {
        // Fallback: download as HTML
        this.downloadAsHTML();
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Fallback: download as HTML
      this.downloadAsHTML();
    }
  }

  private downloadAsHTML(): void {
    const qrCodeImg = this.qrCodeDataUrl.toString();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student ID Card - ${this.student.name} ${this.student.surname}</title>
        <style>
          @page {
            size: 3.375in 2.125in;
            margin: 0;
          }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif; 
            background: white;
          }
          .id-card-container { 
            width: 3.375in; 
            height: 2.125in; 
            border: 2px solid #333; 
            border-radius: 10px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
          }
          .id-card-content { 
            padding: 12px; 
            height: calc(100% - 24px); 
            display: flex; 
            flex-direction: column; 
            justify-content: space-between;
            box-sizing: border-box;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid rgba(255,255,255,0.3); 
            padding-bottom: 8px; 
            margin-bottom: 8px;
          }
          .school-name { 
            font-size: 12px; 
            font-weight: bold; 
            margin: 0; 
            letter-spacing: 1px;
          }
          .school-subtitle {
            font-size: 8px;
            margin: 2px 0 0 0;
            opacity: 0.9;
          }
          .student-info { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            flex: 1;
            gap: 10px;
          }
          .student-details { 
            flex: 1; 
          }
          .student-name { 
            font-size: 14px; 
            font-weight: bold; 
            margin: 0 0 4px 0; 
            line-height: 1.2;
          }
          .student-number { 
            font-size: 9px; 
            margin: 2px 0; 
            opacity: 0.9; 
            font-weight: 600;
            color: #ffd700;
          }
          .student-id { 
            font-size: 9px; 
            margin: 2px 0; 
            opacity: 0.9; 
          }
          .student-gender {
            font-size: 9px;
            margin: 2px 0;
            opacity: 0.9;
          }
          .student-class {
            font-size: 9px;
            margin: 2px 0;
            opacity: 0.9;
          }
          .qr-section { 
            text-align: center; 
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .qr-code { 
            width: 60px; 
            height: 60px; 
            border: 2px solid white; 
            border-radius: 8px; 
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .qr-code img { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
          }
          .qr-label {
            font-size: 7px;
            margin: 4px 0 0 0;
            opacity: 0.8;
          }
          .footer { 
            text-align: center; 
            font-size: 8px; 
            opacity: 0.8; 
            margin-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.3);
            padding-top: 6px;
          }
          .valid-until { 
            font-size: 7px; 
            margin: 0 0 2px 0; 
            font-weight: 600;
          }
          .school-address {
            font-size: 6px;
            margin: 0;
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="id-card-container">
          <div class="id-card-content">
            <div class="header">
              <h2 class="school-name">${(this.schoolName || 'School').toUpperCase()}</h2>
              <p class="school-subtitle">Student Identification Card</p>
            </div>
            <div class="student-info">
              <div class="student-details">
                <h3 class="student-name">${this.student.name} ${this.student.surname}</h3>
                <p class="student-number">Student ID: ${this.student.studentNumber}</p>
                <p class="student-id">ID Number: ${this.student.idnumber}</p>
                <p class="student-gender">Gender: ${this.student.gender}</p>
                <p class="student-class">Class: Grade 8</p>
              </div>
              <div class="qr-section">
                <div class="qr-code">
                  <img src="${qrCodeImg}" alt="QR Code">
                </div>
                <p class="qr-label">Scan for details</p>
              </div>
            </div>
            <div class="footer">
              <p class="valid-until">Valid until: ${(this.currentDate.getFullYear() + 1)}/${(this.currentDate.getMonth() + 1).toString().padStart(2, '0')}/${this.currentDate.getDate().toString().padStart(2, '0')}</p>
              <p class="school-address">${this.schoolAddress || ''}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-id-card-${this.student.studentNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}