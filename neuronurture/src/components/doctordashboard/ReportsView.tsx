import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Users, X } from 'lucide-react';
import jsPDF from 'jspdf'; // ADD THIS IMPORT
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface Patient {
  id: string;
  fullName: string;
  age: number;
  pregnancyStage?: string;
  currentWeek?: number;
  dueDate?: string;
  lastVisit?: string;
}

interface ReportResponse {
  success: boolean;
  message: string;
  report: string;
  patientInfo: {
    name: string;
    age: number;
    pregnancyWeeks: number;
    generatedAt: string;
  };
}

const ReportsView: React.FC<{ doctorId: string }> = ({ doctorId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state variables for report generation
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatingForPatient, setGeneratingForPatient] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportPatientInfo, setReportPatientInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/doctor/patients/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setPatients(data.patients || []);
        } else {
          setPatients([]);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);

  // Updated report generation function
  const handleGenerateReport = async (patientId: string): Promise<void> => {
    try {
      // Clear previous errors
      setError(null);
      
      // Show loading state for specific patient
      setIsGeneratingReport(true);
      setGeneratingForPatient(patientId);
      
      // Make API call to generate report
      const response = await fetch(`${baseUrl}/api/mother/generate-report/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ReportResponse = await response.json();
      
      if (data.success) {
        // Handle successful report generation
        console.log('Report generated successfully:', data.report);
        setGeneratedReport(data.report);
        setReportPatientInfo(data.patientInfo);
        setShowReportModal(true);
      } else {
        throw new Error(data.message || 'Failed to generate report');
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error generating report: ${errorMessage}`);
    } finally {
      setIsGeneratingReport(false);
      setGeneratingForPatient(null);
    }
  };

  // Close modal function
  const closeModal = (): void => {
    setShowReportModal(false);
    setGeneratedReport(null);
    setReportPatientInfo(null);
  };

  // Format report content with proper styling
  const formatReportContent = (report: string) => {
    if (!report) return null;

    // Split by ** to identify headings and content
    const parts = report.split('**');
    const formattedContent: JSX.Element[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      if (i % 2 === 1) {
        // Odd indices are headings (between **)
        formattedContent.push(
          <h3 key={i} className="text-xl font-bold text-gray-800 mb-4 mt-6 first:mt-0 text-left border-b-2 border-blue-200 pb-2">
            {part}
          </h3>
        );
      } else {
        // Even indices are content
        const paragraphs = part.split('\n\n').filter(p => p.trim());
        paragraphs.forEach((paragraph, pIndex) => {
          if (paragraph.trim()) {
            formattedContent.push(
              <div key={`${i}-${pIndex}`} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph.split('\n').map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  // Check if line starts with bullet point or dash
                  if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                    return (
                      <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-blue-600 mr-2 mt-1">•</span>
                        <span className="flex-1">{trimmedLine.substring(2)}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <p key={lineIndex} className="mb-2">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            );
          }
        });
      }
    }

    return formattedContent;
  };

  // UPDATED PDF DOWNLOAD FUNCTION - REPLACE THE OLD downloadReport FUNCTION
  const downloadReport = (): void => {
    if (!generatedReport || !reportPatientInfo) return;
    
    try {
      const doc = new jsPDF();
      
      // Set up fonts and colors
      doc.setFont('helvetica');
      
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Maternal Health Report', 20, 20);
      
      // Add patient info
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(`Patient: ${reportPatientInfo.name}`, 20, 35);
      doc.text(`Age: ${reportPatientInfo.age} years`, 20, 45);
      doc.text(`Pregnancy Week: ${reportPatientInfo.pregnancyWeeks}`, 20, 55);
      doc.text(`Generated: ${new Date(reportPatientInfo.generatedAt).toLocaleDateString()}`, 20, 65);
      
      // Add a line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 75, 190, 75);
      
      // Process and add report content
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      let yPosition = 85;
      const maxWidth = 170;
      const lineHeight = 7;
      
      // Split report into sections
      const sections = generatedReport.split('**');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (!section) continue;
        
        if (i % 2 === 1) {
          // This is a heading
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 30, 30);
          doc.text(section, 20, yPosition);
          yPosition += lineHeight + 3;
          
          // Add underline
          doc.setDrawColor(100, 100, 100);
          doc.line(20, yPosition - 2, 20 + doc.getTextWidth(section), yPosition - 2);
          yPosition += 5;
          
        } else {
          // This is content
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          
          const paragraphs = section.split('\n\n').filter(p => p.trim());
          
          for (const paragraph of paragraphs) {
            const lines = paragraph.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
              
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;
              
              // Handle bullet points
              if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                const bulletText = trimmedLine.substring(2);
                const wrappedText = doc.splitTextToSize(`• ${bulletText}`, maxWidth);
                doc.text(wrappedText, 25, yPosition);
                yPosition += wrappedText.length * lineHeight;
              } else {
                // Regular text
                const wrappedText = doc.splitTextToSize(trimmedLine, maxWidth);
                doc.text(wrappedText, 20, yPosition);
                yPosition += wrappedText.length * lineHeight;
              }
            }
            yPosition += 3; // Space between paragraphs
          }
        }
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 20, 285);
        doc.text('Generated by Maternal Health System', 120, 285);
      }
      
      // Save the PDF
      const fileName = `${reportPatientInfo.name.replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download
      downloadReportAsText();
    }
  };

  // downloading report as txt file
    const downloadReportastxtfile = (): void => {
    if (!generatedReport || !reportPatientInfo) return;
    
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportPatientInfo.name.replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // FALLBACK TEXT DOWNLOAD FUNCTION - ADD THIS NEW FUNCTION
  const downloadReportAsText = (): void => {
    if (!generatedReport || !reportPatientInfo) return;
    
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportPatientInfo.name.replace(/\s+/g, '-')}-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (patientId: string) => {
    alert(`Downloading report for patient ID: ${patientId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading patients...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{patient.fullName}</h3>
                        <div className="text-gray-600 space-y-1">
                          <p>Age: {patient.age} years</p>
                          {patient.pregnancyStage && <p>Stage: {patient.pregnancyStage}</p>}
                          {patient.currentWeek && <p> Pregnancy Week: {patient.currentWeek}</p>}
                          {patient.dueDate && (
                            <p className="text-sm">Due: {new Date(patient.dueDate).toLocaleDateString()}</p>
                          )}
                          {patient.lastVisit && (
                            <p className="text-sm">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReport(patient.id)}
                        disabled={isGeneratingReport}
                        className="hover:bg-indigo-50 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingReport && generatingForPatient === patient.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(patient.id)}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report as txt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients found</h3>
                <p className="text-gray-500">Patients will appear here once assigned to you.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Enhanced Report Modal */}
      {showReportModal && generatedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Maternal Health Report
                </h2>
                {reportPatientInfo && (
                  <div className="mt-2 text-gray-600">
                    <p className="font-medium">{reportPatientInfo.name}</p>
                    <p className="text-sm">
                      Age: {reportPatientInfo.age} years • Week: {reportPatientInfo.pregnancyWeeks} • 
                      Generated: {new Date(reportPatientInfo.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={downloadReport}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={closeModal}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 bg-white">
                <div className="max-w-none prose prose-lg">
                  {formatReportContent(generatedReport)}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Report generated on {reportPatientInfo && new Date(reportPatientInfo.generatedAt).toLocaleString()}
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={closeModal}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button 
                  onClick={downloadReport}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;