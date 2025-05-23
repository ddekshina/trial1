import { useState } from 'react';
import { 
  FacebookShareButton, 
  LinkedinShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import { Download, Share2, X, FileText, Mail, MessageCircle } from 'lucide-react';
import { downloadPDF, getPDFBlob } from '../utils/pdfGenerator';

const DownloadShareButtons = ({ formData, formId, isVisible = true }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = window.location.href;
  const shareTitle = `Pricing Analysis Report${formId ? ` - ${formId}` : ''}`;
  const shareDescription = `Check out this pricing analysis report for ${formData.clientName || 'client project'}: ${formData.projectTitle || 'project'}`;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      downloadPDF(formData, formId);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        setIsGenerating(true);
        const pdfBlob = getPDFBlob(formData, formId);
        const fileName = `pricing-analysis-${formId || 'new'}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
          files: [file]
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to modal if native sharing fails
          setShowShareModal(true);
        }
      } finally {
        setIsGenerating(false);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleEmailWithAttachment = async () => {
    try {
      setIsGenerating(true);
      const pdfBlob = getPDFBlob(formData, formId);
      const fileName = `pricing-analysis-${formId || 'new'}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create a data URL for the PDF
      const reader = new FileReader();
      reader.onload = function() {
        const dataUrl = this.result;
        const emailBody = `Please find attached the pricing analysis report.

Project: ${formData.projectTitle || 'N/A'}
Client: ${formData.clientName || 'N/A'}
Generated: ${new Date().toLocaleDateString()}

Best regards`;
        
        const mailtoLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error('Error preparing email:', error);
      // Fallback to simple email without attachment
      const emailBody = `Please check out this pricing analysis report:

${shareUrl}

Project: ${formData.projectTitle || 'N/A'}
Client: ${formData.clientName || 'N/A'}`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6">
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <Download size={18} />
          )}
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>

        <button
          onClick={handleWebShare}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <Share2 size={18} />
          )}
          {isGenerating ? 'Preparing...' : 'Share'}
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Share Report</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <FacebookShareButton
                  url={shareUrl}
                  quote={shareDescription}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <FacebookIcon size={32} round />
                  <span className="ml-2 text-sm font-medium">Facebook</span>
                </FacebookShareButton>

                <LinkedinShareButton
                  url={shareUrl}
                  title={shareTitle}
                  summary={shareDescription}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <LinkedinIcon size={32} round />
                  <span className="ml-2 text-sm font-medium">LinkedIn</span>
                </LinkedinShareButton>

                <TwitterShareButton
                  url={shareUrl}
                  title={shareDescription}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <TwitterIcon size={32} round />
                  <span className="ml-2 text-sm font-medium">Twitter</span>
                </TwitterShareButton>

                <WhatsappShareButton
                  url={shareUrl}
                  title={shareDescription}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <WhatsappIcon size={32} round />
                  <span className="ml-2 text-sm font-medium">WhatsApp</span>
                </WhatsappShareButton>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEmailWithAttachment}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
                >
                  <Mail size={20} />
                  <span className="text-sm font-medium">
                    {isGenerating ? 'Preparing...' : 'Email with PDF'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition duration-200"
                >
                  <FileText size={20} />
                  <span className="text-sm font-medium">Copy Link</span>
                </button>
              </div>

              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 break-all">{shareUrl}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadShareButtons;