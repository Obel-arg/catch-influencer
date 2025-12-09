import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CampaignData } from './excel-export';

/**
 * Export campaign dashboard UI to PDF by capturing the visual dashboard
 */
export async function exportCampaignPostsToPDF(campaign: CampaignData): Promise<void> {
  try {
    console.log('📸 Starting dashboard capture for PDF export...');

    // Find the dashboard container element
    const dashboardElement = document.querySelector('[data-dashboard-export]') as HTMLElement;

    if (!dashboardElement) {
      throw new Error('Dashboard element not found. Make sure to add data-dashboard-export attribute to the dashboard container.');
    }

    // Save original styles
    const originalWidth = dashboardElement.style.width;
    const originalMaxWidth = dashboardElement.style.maxWidth;
    const originalMinWidth = dashboardElement.style.minWidth;
    const originalPosition = dashboardElement.style.position;
    const originalLeft = dashboardElement.style.left;
    const originalTop = dashboardElement.style.top;
    const originalZIndex = dashboardElement.style.zIndex;
    const originalPadding = dashboardElement.style.padding;

    // Get parent element to restore later
    const parent = dashboardElement.parentElement;

    try {
      // Temporarily set a fixed width for better rendering (optimal for PDF)
      const captureWidth = 1200; // Balanced width for good rendering without being too large
      dashboardElement.style.width = `${captureWidth}px`;
      dashboardElement.style.minWidth = `${captureWidth}px`;
      dashboardElement.style.maxWidth = `${captureWidth}px`;
      dashboardElement.style.position = 'absolute';
      dashboardElement.style.left = '-9999px'; // Move off-screen
      dashboardElement.style.top = '0';
      dashboardElement.style.zIndex = '-1';
      dashboardElement.style.padding = '20px'; // Add padding to ensure content isn't cut

      // Scroll to top to ensure full capture
      window.scrollTo(0, 0);

      // Wait for layout reflow and fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Wait for fonts
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading warning:', e);
      }

      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the actual height including all content
      const actualHeight = dashboardElement.scrollHeight;

      // Capture the dashboard as canvas with high quality
      console.log(`📸 Capturing dashboard at ${captureWidth}px width x ${actualHeight}px height...`);
      const canvas = await html2canvas(dashboardElement, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        logging: true, // Enable logging to debug
        backgroundColor: '#ffffff',
        width: captureWidth,
        height: actualHeight,
        windowWidth: captureWidth,
        windowHeight: actualHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        letterRendering: false
      });

      console.log('✅ Canvas captured, dimensions:', canvas.width, 'x', canvas.height);

    console.log('📄 Creating PDF...');

    // Calculate PDF dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4 dimensions in mm
    const pdfWidth = 210; // A4 width in portrait
    const pdfHeight = 297; // A4 height in portrait

    // Calculate scaling to fit width
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Determine orientation based on aspect ratio
    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Calculate how many pages we need
    const pageCanvas = document.createElement('canvas');
    const pageContext = pageCanvas.getContext('2d');

    if (!pageContext) {
      throw new Error('Could not get canvas context');
    }

    // Set page canvas size to match PDF page dimensions (in pixels)
    const pageWidthPx = (pageWidth * canvas.width) / scaledWidth;
    const pageHeightPx = (pageHeight * canvas.height) / scaledHeight;

    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeightPx;

    let position = 0;
    let page = 0;

    while (position < canvas.height) {
      if (page > 0) {
        pdf.addPage();
      }

      // Clear the page canvas
      pageContext.fillStyle = '#ffffff';
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      // Draw the portion of the original canvas onto the page canvas
      pageContext.drawImage(
        canvas,
        0, position,
        canvas.width, Math.min(pageHeightPx, canvas.height - position),
        0, 0,
        canvas.width, Math.min(pageHeightPx, canvas.height - position)
      );

      // Add the page canvas to the PDF
      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pageWidth, pageHeight);

      position += pageHeightPx;
      page++;

      console.log(`📄 Added page ${page}, position: ${position}/${canvas.height}`);
    }

    // Add footer to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);

      // Page number
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );

      // Campaign name and date
      pdf.text(
        `${campaign.name} - ${new Date().toLocaleDateString('es-ES')}`,
        pageWidth - 10,
        pageHeight - 5,
        { align: 'right' }
      );
    }

      // Save the PDF
      const fileName = `Dashboard_${campaign.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      console.log('✅ Dashboard PDF exported successfully:', fileName);
    } finally {
      // Restore original styles
      dashboardElement.style.width = originalWidth;
      dashboardElement.style.maxWidth = originalMaxWidth;
      dashboardElement.style.minWidth = originalMinWidth;
      dashboardElement.style.position = originalPosition;
      dashboardElement.style.left = originalLeft;
      dashboardElement.style.top = originalTop;
      dashboardElement.style.zIndex = originalZIndex;
      dashboardElement.style.padding = originalPadding;

      console.log('🔄 Dashboard styles restored');
    }
  } catch (error) {
    console.error('❌ Error exporting dashboard to PDF:', error);
    throw new Error('Error al generar el PDF del dashboard');
  }
}
