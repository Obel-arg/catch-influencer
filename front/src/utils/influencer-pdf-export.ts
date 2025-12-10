import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDF_BRANDING } from '@/constants/pdf-branding';

/**
 * Export influencer profile in Squad format to PDF
 */
export async function exportInfluencerSquadPDF(influencerName: string): Promise<void> {
  try {
    console.log('📸 Starting Squad PDF capture...');

    // Find the Squad template element
    const templateElement = document.querySelector('[data-squad-pdf-template]') as HTMLElement;

    if (!templateElement) {
      throw new Error('Squad PDF template not found. Make sure to render InfluencerSquadPDFTemplate component.');
    }

    // Wait for layout and fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Wait for fonts
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading warning:', e);
    }

    // Additional wait for Recharts to render
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`📸 Capturing template at ${PDF_BRANDING.dimensions.a4Width}px x ${PDF_BRANDING.dimensions.a4Height}px...`);

    // Capture the template as canvas with high quality
    const canvas = await html2canvas(templateElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#F3F4F6',
      width: PDF_BRANDING.dimensions.a4Width,
      height: PDF_BRANDING.dimensions.a4Height,
      windowWidth: PDF_BRANDING.dimensions.a4Width,
      windowHeight: PDF_BRANDING.dimensions.a4Height,
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
      foreignObjectRendering: false,
      imageTimeout: 0,
    });

    console.log('✅ Canvas captured, dimensions:', canvas.width, 'x', canvas.height);
    console.log('📄 Creating PDF...');

    // A4 dimensions in mm (landscape)
    const pdfWidth = 297; // A4 width in landscape
    const pdfHeight = 210; // A4 height in landscape

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Add image to PDF (single page, fixed size)
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Save the PDF
    const fileName = `Squad_${influencerName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('✅ Squad PDF exported successfully:', fileName);
  } catch (error) {
    console.error('❌ Error exporting Squad PDF:', error);
    throw new Error('Error al generar el PDF del Squad');
  }
}

/**
 * Export influencer profile modal to PDF by capturing the visual content
 * @deprecated Use exportInfluencerSquadPDF for the new Squad format
 */
export async function exportInfluencerProfileToPDF(influencerName: string): Promise<void> {
  try {
    console.log('📸 Starting influencer profile capture for PDF export...');

    // Find the modal content element
    const modalElement = document.querySelector('[data-influencer-export]') as HTMLElement;

    if (!modalElement) {
      throw new Error('Modal element not found. Make sure to add data-influencer-export attribute to the modal content container.');
    }

    // Get parent modal panel to adjust its width too
    const modalPanel = modalElement.closest('.fixed') as HTMLElement;

    // Save original styles
    const originalOverflow = modalElement.style.overflow;
    const originalMaxHeight = modalElement.style.maxHeight;
    const originalHeight = modalElement.style.height;
    const originalWidth = modalElement.style.width;
    const originalMinWidth = modalElement.style.minWidth;

    // Save panel original width if exists
    let originalPanelWidth = '';
    if (modalPanel) {
      originalPanelWidth = modalPanel.style.width;
    }

    // Arrays to store original truncate styles (declared outside try-finally for scope)
    const originalOverflows: string[] = [];
    const originalWhiteSpaces: string[] = [];
    const originalTextOverflows: string[] = [];

    try {
      // Temporarily adjust styles for full capture with optimal width
      const captureWidth = 800; // Wider capture width to prevent text cutoff

      if (modalPanel) {
        modalPanel.style.width = `${captureWidth}px`;
      }

      modalElement.style.overflow = 'visible';
      modalElement.style.maxHeight = 'none';
      modalElement.style.height = 'auto';
      modalElement.style.width = `${captureWidth}px`;
      modalElement.style.minWidth = `${captureWidth}px`;

      // 🔧 FIX: Remove truncate effect from all elements with .truncate class
      const truncatedElements = modalElement.querySelectorAll('.truncate');

      truncatedElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        originalOverflows[index] = htmlEl.style.overflow;
        originalWhiteSpaces[index] = htmlEl.style.whiteSpace;
        originalTextOverflows[index] = htmlEl.style.textOverflow;

        // Override truncate styles
        htmlEl.style.overflow = 'visible';
        htmlEl.style.whiteSpace = 'normal';
        htmlEl.style.textOverflow = 'clip';
      });

      // Scroll modal to top to ensure full capture
      modalElement.scrollTop = 0;
      if (modalPanel) {
        modalPanel.scrollTop = 0;
      }

      // Wait for layout reflow and fonts to load
      await new Promise(resolve => setTimeout(resolve, 800));

      // Wait for fonts
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading warning:', e);
      }

      // Additional wait for dynamic content (charts, etc.)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the actual height including all content
      const actualHeight = modalElement.scrollHeight;
      const actualWidth = captureWidth; // Use the fixed capture width

      // Capture the modal as canvas with high quality
      console.log(`📸 Capturing modal at ${actualWidth}px width x ${actualHeight}px height...`);
      const canvas = await html2canvas(modalElement, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        logging: false,
        backgroundColor: '#ffffff',
        width: actualWidth,
        height: actualHeight,
        windowWidth: actualWidth,
        windowHeight: actualHeight,
        scrollX: 0,
        scrollY: -window.scrollY, // Compensate for page scroll
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
      });

      console.log('✅ Canvas captured, dimensions:', canvas.width, 'x', canvas.height);

      console.log('📄 Creating PDF...');

      // A4 dimensions in mm
      const pdfWidth = 210; // A4 width in portrait
      const pdfHeight = 297; // A4 height in portrait

      // Calculate scaling to fit width
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Calculate how many pages we need
      const totalPages = Math.ceil(scaledHeight / pageHeight);

      // Create a temporary canvas for splitting pages
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');

      if (!pageContext) {
        throw new Error('Could not get canvas context');
      }

      pageCanvas.width = imgWidth;

      // Split into pages
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the slice of the original canvas for this page
        const sourceY = (page * pageHeight) / ratio;
        const sourceHeight = Math.min(pageHeight / ratio, imgHeight - sourceY);

        pageCanvas.height = sourceHeight;

        // Clear the page canvas
        pageContext.fillStyle = '#ffffff';
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw the portion of the original canvas onto the page canvas
        pageContext.drawImage(
          canvas,
          0, sourceY,
          imgWidth, sourceHeight,
          0, 0,
          imgWidth, sourceHeight
        );

        // Add the page canvas to the PDF
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const pageScaledHeight = sourceHeight * ratio;
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pageWidth, pageScaledHeight);

        console.log(`📄 Added page ${page + 1}/${totalPages}`);
      }

      // Add footer to all pages
      const totalPdfPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPdfPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);

        // Page number
        pdf.text(
          `Página ${i} de ${totalPdfPages}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );

        // Influencer name and date
        pdf.text(
          `${influencerName} - ${new Date().toLocaleDateString('es-ES')}`,
          pageWidth - 10,
          pageHeight - 5,
          { align: 'right' }
        );
      }

      // Save the PDF
      const fileName = `Influencer_${influencerName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      console.log('✅ Influencer profile PDF exported successfully:', fileName);
    } finally {
      // Restore original styles for modal
      modalElement.style.overflow = originalOverflow;
      modalElement.style.maxHeight = originalMaxHeight;
      modalElement.style.height = originalHeight;
      modalElement.style.width = originalWidth;
      modalElement.style.minWidth = originalMinWidth;

      if (modalPanel && originalPanelWidth !== undefined) {
        modalPanel.style.width = originalPanelWidth;
      }

      // Restore truncate styles for all truncated elements
      const truncatedElements = modalElement.querySelectorAll('.truncate');
      truncatedElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        if (originalOverflows && originalOverflows[index] !== undefined) {
          htmlEl.style.overflow = originalOverflows[index];
        }
        if (originalWhiteSpaces && originalWhiteSpaces[index] !== undefined) {
          htmlEl.style.whiteSpace = originalWhiteSpaces[index];
        }
        if (originalTextOverflows && originalTextOverflows[index] !== undefined) {
          htmlEl.style.textOverflow = originalTextOverflows[index];
        }
      });

      console.log('🔄 Modal styles restored');
    }
  } catch (error) {
    console.error('❌ Error exporting influencer profile to PDF:', error);
    throw new Error('Error al generar el PDF del perfil del influencer');
  }
}
