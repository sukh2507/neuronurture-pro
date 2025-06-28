import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, User, X, Calendar, Baby } from 'lucide-react';
import jsPDF from 'jspdf';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface ChildProfile {
  _id: string;
  fullName: string; // Changed from 'name' to 'fullName'
  dateOfBirth: string; // Add this field
  age?: number; // Keep this as optional calculated field
  gender?: string;
  healthHistory?: string[];
  learningConcerns?: string[];
  screening?: {
    [key: string]: {
      mentalCheck?: string;
      score?: number;
      matches?: number;
      timeTaken?: number;
      misses?: number;
      reactionTime?: number;
      completedPatterns?: number;
      accuracy?: number;
      questionsAttempted?: number;
      correctAnswers?: number;
      reasoningTime?: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

interface MotherProfile {
  _id: string;
  fullName: string;
  age: number;
  pregnancyStage?: string;
  currentWeek?: number;
  dueDate?: string;
  lastCheckup?: string;
  email?: string;
  currentChildren?: string[];}

interface ReportResponse {
  success: boolean;
  message: string;
  report: string;
  patientInfo: {
    name: string;
    age: number;
    pregnancyWeeks?: number; // Make this optional for child reports
    generatedAt: string;
    isChild?: boolean; // Add flag to distinguish child reports
  };
}

const MaternalSelfReports: React.FC<{ motherId: string }> = ({ motherId }) => {
  const [motherProfile, setMotherProfile] = useState<MotherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Report generation state
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportPatientInfo, setReportPatientInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMotherProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the same endpoint that works in Dashboard component
        const res = await fetch(`${baseUrl}/api/mother/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Mother profile data received in reports:', data);
          setMotherProfile(data);
        } else if (res.status === 404) {
          setError('Mother profile not found. Please complete your profile first.');
        } else {
          const errorData = await res.json();
          setError(`Failed to load profile: ${errorData.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Error fetching mother profile:', err);
        setError('Network error while fetching profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchMotherProfile();
  }, [motherId]);

  // Generate report for mother herself
  const handleGenerateReport = async (): Promise<void> => {
    if (!motherProfile?._id) {
      setError('Profile not loaded. Please try refreshing the page.');
      return;
    }

    try {
      setError(null);
      setIsGeneratingReport(true);
      
      // Make API call to generate report using mother's own ID
      const response = await fetch(`${baseUrl}/api/mother/generate-report/${motherProfile._id}`, {
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
    }
  };

  const handleGenerateChildReport = async (childId: string) => {
  try {
    setIsGeneratingReport(true);
    setError(null);

    console.log('Generating report for child:', childId);

    const response = await fetch(`${baseUrl}/api/child/generate-report/${childId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: ReportResponse = await response.json();
    console.log('Child report generated successfully:', data);

    if (data.success) {
      setGeneratedReport(data.report);
      setReportPatientInfo(data.patientInfo);
      setShowReportModal(true);
    } else {
      throw new Error(data.message || 'Failed to generate child report');
    }
  } catch (error) {
    console.error('Child report error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setError(`Error generating child report: ${errorMessage}`);
  } finally {
    setIsGeneratingReport(false);
  }
};


const getAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};


const ChildReportCard: React.FC<{ childId: string; onGenerateReport: (id: string) => void }> = ({
  childId,
  onGenerateReport
}) => {
  const [childData, setChildData] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/child/${childId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched child data:", data);
        setChildData(data);
      } catch (err) {
        console.error('Failed to load child:', err);
        setError(err instanceof Error ? err.message : 'Failed to load child data');
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [childId]);

  if (loading) {
    return (
      <Card className="p-4 bg-gray-50 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading child info...
        </div>
      </Card>
    );
  }

  if (error || !childData) {
    return (
      <Card className="p-4 bg-red-50 text-center text-sm text-red-600 border border-red-200">
        <div className="flex items-center justify-center gap-2">
          <X className="h-4 w-4" />
          Failed to load child data: {error || 'Unknown error'}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-indigo-100 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-indigo-800">
              {childData.fullName}
            </h3>
            <p className="text-sm text-gray-500">
              DOB: {new Date(childData.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-700 space-y-1 mt-2">
          <p>
            <strong>Age:</strong> {getAge(childData.dateOfBirth)} years
          </p>
          <p>
            <strong>Gender:</strong> {childData.gender || "N/A"}
          </p>
          {childData.screening && Object.keys(childData.screening).length > 0 && (
            <p>
              <strong>Screenings:</strong> {Object.keys(childData.screening).length} completed
            </p>
          )}
        </div>

        <Button
          onClick={() => onGenerateReport(childData._id)}
          className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          disabled={!childData.screening || Object.keys(childData.screening).length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          {!childData.screening || Object.keys(childData.screening).length === 0 
            ? 'No Screening Data' 
            : 'Generate Child Report'
          }
        </Button>
      </CardContent>
    </Card>
  );
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

    const parts = report.split('**');
    const formattedContent: JSX.Element[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      if (i % 2 === 1) {
        // Odd indices are headings (between **)
        formattedContent.push(
          <h3 key={i} className="text-xl font-bold text-gray-800 mb-4 mt-6 first:mt-0 text-left border-b-2 border-pink-200 pb-2">
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
                  
                  if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                    return (
                      <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-pink-600 mr-2 mt-1">•</span>
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

  // Process report text for PDF (remove markdown and format properly)
  const processReportForPDF = (report: string): { text: string; sections: Array<{ title: string; content: string }> } => {
    if (!report) return { text: '', sections: [] };

    const parts = report.split('**');
    const sections: Array<{ title: string; content: string }> = [];
    let currentTitle = '';
    let fullText = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      if (i % 2 === 1) {
        // Odd indices are headings (between **)
        currentTitle = part;
        fullText += `\n\n${part.toUpperCase()}\n${'='.repeat(part.length)}\n`;
      } else {
        // Even indices are content
        const cleanContent = part
          .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
          .replace(/^\* /gm, '• ') // Convert asterisk bullets to bullet points
          .replace(/^- /gm, '• ') // Convert dash bullets to bullet points
          .trim();
        
        if (currentTitle && cleanContent) {
          sections.push({ title: currentTitle, content: cleanContent });
          currentTitle = '';
        }
        
        fullText += cleanContent + '\n';
      }
    }

    return { text: fullText.trim(), sections };
  };

  // Download report as PDF
  // Download report as PDF
const downloadReportAsPDF = (): void => {
  if (!generatedReport || !reportPatientInfo) return;

  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addTextWithWrap = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (y + (i * fontSize * 0.4) > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(lines[i], x, y + (i * fontSize * 0.4));
      }
      
      return y + (lines.length * fontSize * 0.4);
    };

    // Header section with appropriate background color
    const isChildReport = reportPatientInfo.isChild;
    if (isChildReport) {
  pdf.setFillColor(199, 210, 254); // Blue for child
} else {
  pdf.setFillColor(252, 231, 243); // Pink for mother
}
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Title
if (isChildReport) {
  pdf.setTextColor(37, 99, 235); // Blue for child
} else {
  pdf.setTextColor(157, 23, 77); // Dark pink for mother
}    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const title = isChildReport ? 'CHILD HEALTH REPORT' : 'MATERNAL HEALTH REPORT';
    pdf.text(title, pageWidth / 2, 25, { align: 'center' });
    
    // Report date on same line as "Date:"
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    yPosition = 40;
    pdf.text(`Date: ${new Date(reportPatientInfo.generatedAt).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition = 65;

    // Child/Patient Information section
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
if (isChildReport) {
  pdf.setTextColor(37, 99, 235);
} else {
  pdf.setTextColor(157, 23, 77);
}    const infoHeader = isChildReport ? 'CHILD INFORMATION' : 'PATIENT INFORMATION';
    pdf.text(infoHeader, margin, yPosition);
    yPosition += 10;

    // Add underline
if (isChildReport) {
  pdf.setDrawColor(37, 99, 235);
} else {
  pdf.setDrawColor(236, 72, 153);
}    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Patient info in same line format
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    
    pdf.text(`Name: ${reportPatientInfo.name}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Age: ${reportPatientInfo.age} years`, margin, yPosition);
    yPosition += 6;
    
    // Only add pregnancy weeks for maternal reports
    if (!isChildReport && reportPatientInfo.pregnancyWeeks) {
      pdf.text(`Pregnancy Week: ${reportPatientInfo.pregnancyWeeks}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 10;

    // Process the report content
    const { sections } = processReportForPDF(generatedReport);

    // Add report content
    sections.forEach((section) => {
      // Check if we need a new page for the section header
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Section header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
if (isChildReport) {
  pdf.setTextColor(37, 99, 235);
} else {
  pdf.setTextColor(157, 23, 77);
}      yPosition = addTextWithWrap(section.title, margin, yPosition, maxLineWidth, 14);
      yPosition += 3;

      // Add underline
if (isChildReport) {
  pdf.setDrawColor(37, 99, 235);
} else {
  pdf.setDrawColor(236, 72, 153);
}      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Section content
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      const paragraphs = section.content.split('\n\n');
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          yPosition = addTextWithWrap(paragraph.trim(), margin, yPosition, maxLineWidth, 10);
          yPosition += 5; // Reduced space between paragraphs
        }
      });

      yPosition += 8; // Reduced space between sections
    });

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      const footerText = isChildReport ? 'Generated by Child Health System' : 'Generated by Maternal Health System';
      pdf.text(footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });
    }

    // Save the PDF
    const reportType = isChildReport ? 'child-health-report' : 'maternal-health-report';
    const fileName = `${reportType}-${reportPatientInfo.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    setError('Failed to generate PDF. Please try again.');
  }
};

  // Download report as text file (keeping the original function)
  const downloadReportAsText = (): void => {
    if (!generatedReport || !reportPatientInfo) return;
    
    const reportContent = `
MATERNAL HEALTH REPORT
======================

Patient: ${reportPatientInfo.name}
Age: ${reportPatientInfo.age} years
Pregnancy Week: ${reportPatientInfo.pregnancyWeeks}
Generated: ${new Date(reportPatientInfo.generatedAt).toLocaleString()}

${generatedReport}

---
Generated by Maternal Health System
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-health-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Health Reports</h1>
        <p className="text-gray-600">Generate and view your personalized maternal health reports</p>
      </div>

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
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
          <span className="ml-2 text-gray-600">Loading your profile...</span>
        </div>
      ) : motherProfile ? (
        <div className="grid gap-6">
  {/* Profile Summary Card */}
  <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
    <CardContent className="p-6 ">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-pink-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{motherProfile.fullName}</h2>
          <p className="text-gray-600">Age: {motherProfile.age} years</p>
        </div>
      </div>

      {/* Info Grid + Button in one line */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {motherProfile.pregnancyStage && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Baby className="h-5 w-5 text-pink-600" />
            <div>
              <p className="text-sm text-gray-600">Stage</p>
              <p className="font-semibold">{motherProfile.pregnancyStage}</p>
            </div>
          </div>
        )}

        {motherProfile.currentWeek && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-pink-600" />
            <div>
              <p className="text-sm text-gray-600">Current Week</p>
              <p className="font-semibold">Week {motherProfile.currentWeek}</p>
            </div>
          </div>
        )}

        {motherProfile.dueDate && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-pink-600" />
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-semibold">
                {new Date(motherProfile.dueDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {getDaysUntilDue(motherProfile.dueDate) > 0
                  ? `${getDaysUntilDue(motherProfile.dueDate)} days to go`
                  : 'Due date passed'}
              </p>
            </div>
          </div>
        )}

        {/* Button aligned as 4th column box */}
        <div className="flex items-center justify-center  bg-white p-3 rounded-lg">
          <Button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className=" bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 -mr-1" />
                Generate Mother Report
              </>
            )}
          </Button>
        </div>
      </div>

      {motherProfile.lastCheckup && (
        <div className="text-sm text-gray-600 mb-4">
          Last checkup: {new Date(motherProfile.lastCheckup).toLocaleDateString()}
        </div>
      )}
    </CardContent>
  </Card>

      
     {motherProfile.currentChildren?.length > 0 && (
  <section className="mt-0">
    <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded shadow-md">
      👶 Child Reports
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {motherProfile.currentChildren.map((childId) => (
        <ChildReportCard
          key={childId}
          childId={childId}
          onGenerateReport={handleGenerateChildReport}
        />
      ))}
    </div>
  </section>
)}


  {/* Report Generation Card */}
  {/* <Card className="hover:shadow-lg transition-shadow">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl">
        <FileText className="h-6 w-6 text-pink-600" />
        Generate Health Report
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Generate a comprehensive health report based on your current pregnancy data, 
          health records, and personalized recommendations.
        </p>

        <Button
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Your Report...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Generate My Health Report
            </>
          )}
        </Button>
      </div>
    </CardContent>
  </Card> */}
        </div>

      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Profile not found</h3>
            <p className="text-gray-500">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      )}

      

      {/* Enhanced Report Modal */}
{showReportModal && generatedReport && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-5xl max-h-[90vh] w-full flex flex-col shadow-2xl">
      {/* Modal Header */}
      <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-pink-50 to-purple-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-pink-600" />
            {reportPatientInfo?.isChild ? 'Child Health Report' : 'My Health Report'}
          </h2>
          {reportPatientInfo && (
            <div className="mt-2 text-gray-600">
              <p className="font-medium">{reportPatientInfo.name}</p>
              <p className="text-sm">
                Age: {reportPatientInfo.age} years
                {reportPatientInfo.pregnancyWeeks && ` • Week: ${reportPatientInfo.pregnancyWeeks}`} • 
                Generated: {new Date(reportPatientInfo.generatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={downloadReportAsPDF}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            onClick={downloadReportAsText}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            TXT
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
            onClick={downloadReportAsPDF}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default MaternalSelfReports;