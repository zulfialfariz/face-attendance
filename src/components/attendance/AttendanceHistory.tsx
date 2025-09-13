
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';
import { AttendanceRecord } from '@/types/user';

const AttendanceHistory: React.FC = () => {
  const [dateFilter, setDateFilter] = useState('');
  
  // Mock data - in real app this would come from API
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      userId: 'current-user',
      userName: 'John Doe',
      checkIn: '09:00:00',
      checkOut: '17:30:00',
      date: '2024-01-15',
      status: 'Present'
    },
    {
      id: '2',
      userId: 'current-user',
      userName: 'John Doe',
      checkIn: '09:15:00',
      checkOut: '17:25:00',
      date: '2024-01-14',
      status: 'Late'
    },
    {
      id: '3',
      userId: 'current-user',
      userName: 'John Doe',
      checkIn: '08:45:00',
      checkOut: '17:00:00',
      date: '2024-01-13',
      status: 'Present'
    },
    {
      id: '4',
      userId: 'current-user',
      userName: 'John Doe',
      checkIn: '08:55:00',
      checkOut: '17:35:00',
      date: '2024-01-12',
      status: 'Present'
    },
    {
      id: '5',
      userId: 'current-user',
      userName: 'John Doe',
      checkIn: '',
      checkOut: '',
      date: '2024-01-11',
      status: 'Absent'
    }
  ]);

  const filteredRecords = dateFilter 
    ? attendanceRecords.filter(record => record.date.includes(dateFilter))
    : attendanceRecords;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'Late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'Absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateWorkingHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '-';
    
    const [inHour, inMinute] = checkIn.split(':').map(Number);
    const [outHour, outMinute] = checkOut.split(':').map(Number);
    
    const inTime = inHour * 60 + inMinute;
    const outTime = outHour * 60 + outMinute;
    
    const diffMinutes = outTime - inTime;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
        <p className="text-gray-600 mt-1">View your attendance records and working hours</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>My Attendance Records</span>
            </CardTitle>
            <div className="flex space-x-4">
              <Input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" onClick={() => setDateFilter('')}>
                Clear Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Check In</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Working Hours</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(record.date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {record.checkIn || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {record.checkOut || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {calculateWorkingHours(record.checkIn, record.checkOut)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(record.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-600">No attendance records found for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {attendanceRecords.filter(r => r.status === 'Present').length}
              </p>
              <p className="text-sm text-gray-600">Present Days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {attendanceRecords.filter(r => r.status === 'Late').length}
              </p>
              <p className="text-sm text-gray-600">Late Days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {attendanceRecords.filter(r => r.status === 'Absent').length}
              </p>
              <p className="text-sm text-gray-600">Absent Days</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((attendanceRecords.filter(r => r.status === 'Present').length / attendanceRecords.length) * 100)}%
              </p>
              <p className="text-sm text-gray-600">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceHistory;
