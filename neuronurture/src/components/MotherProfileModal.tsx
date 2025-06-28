import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, Phone } from 'lucide-react';

const MotherProfileModal = ({ open, onClose, patient }) => {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700">
            {patient.fullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Email:</p>
              <p>{patient.email}</p>
            </div>
            <div>
              <p className="font-medium">Phone:</p>
              <p>{patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Age:</p>
              <p>{patient.age}</p>
            </div>
            <div>
              <p className="font-medium">Pregnancy Stage:</p>
              <Badge variant="outline">{patient.pregnancyStage}</Badge>
            </div>
            <div>
              <p className="font-medium">Due Date:</p>
              <p>{new Date(patient.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium">Current Week:</p>
              <p>{patient.currentWeek || 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="font-medium">Address:</p>
            <p>{typeof patient.address === 'string' ? patient.address : JSON.stringify(patient.address)}</p>
          </div>

          <div>
            <p className="font-medium">Medical History:</p>
            <p>{patient.medicalHistory || 'N/A'}</p>
          </div>

          <div>
            <p className="font-medium">Joined Date:</p>
            <p>{new Date(patient.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MotherProfileModal;
