import React from 'react';
import { Calendar, Clock, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DoctorOverview = ({ patients, doctorProfile, loading }: any) => {
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, Dr. {doctorProfile?.fullName || 'Doctor'}
          </h1>
          <p className="text-gray-600">{doctorProfile?.specialty || 'Specialist'}</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Consultation
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Patients</p>
                <p className="text-3xl font-bold">{patients?.length || 0}</p>
              </div>
              <Users className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100">Today's Appointments</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <Calendar className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Pending Reports</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <FileText className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Experience</p>
                <p className="text-3xl font-bold">{doctorProfile?.experience || 0}y</p>
              </div>
              <Clock className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients?.slice(0, 5).map((patient: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.fullName}</p>
                    <p className="text-sm text-gray-600">Last visit: 2 days ago</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center">No patients assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Sarah Johnson - Consultation</p>
                  <p className="text-sm text-gray-600">10:00 AM - 10:30 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Emma Wilson - Follow-up</p>
                  <p className="text-sm text-gray-600">2:00 PM - 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Michael Brown - Screening Review</p>
                  <p className="text-sm text-gray-600">4:00 PM - 4:30 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorOverview;
