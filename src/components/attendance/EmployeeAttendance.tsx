
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, CalendarDays } from 'lucide-react';
import { AttendanceRecord } from '@/types/user';

const EmployeeAttendance: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  // Mock data - in real app this would come from API
  const [attendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      userId: '3',
      userName: 'John Doe',
      checkIn: '09:00:00',
      checkOut: '17:30:00',
      date: '2024-01-15',
      status: 'Present'
    },
    {
      id: '2',
      userId: '4',
      userName: 'Jane Smith',
      checkIn: '09:15:00',
      checkOut: '17:25:00',
      date: '2024-01-15',
      status: 'Late'
    },
    {
      id: '3',
      userId: '5',
      userName: 'Bob Johnson',
      checkIn: '',
      checkOut: '',
      date: '2024-01-15',
      status: 'Absent'
    },
    {
      id: '4',
      userId: '3',
      userName: 'John Doe',
      checkIn: '08:45:00',
      checkOut: '17:00:00',
      date: '2024-01-14',
      status: 'Present'
    },
    {
      id: '5',
      userId: '4',
      userName: 'Jane Smith',
      checkIn: '08:55:00',
      checkOut: '17:35:00',
      date: '2024-01-14',
      status: 'Present'
    },
    {
      id: '6',
      userId: '5',
      userName: 'Bob Johnson',
      checkIn: '09:20:00',
      checkOut: '17:15:00',
      date: '2024-01-14',
      status: 'Late'
    }
  ]);

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date.includes(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

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

  const exportToExcel = () => {
    // In a real application, you would implement actual Excel export functionality
    toast({
      title: "Export Started",
      description: "Attendance data is being exported to Excel format."
    });
    
    // Mock download
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Attendance report has been downloaded successfully."
      });
    }, 2000);
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    return {
      total: todayRecords.length,
      present: todayRecords.filter(r => r.status === 'Present').length,
      late: todayRecords.filter(r => r.status === 'Late').length,
      absent: todayRecords.filter(r => r.status === 'Absent').length
    };
  };

  const stats = getTodayStats();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Attendance Records</h1>
        <p className="text-gray-600 mt-1">Monitor and export attendance data for all employees</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-sm text-gray-600">Present Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-sm text-gray-600">Late Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-sm text-gray-600">Absent Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5" />
              <span>Attendance Records</span>
            </CardTitle>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-48"
              />
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full md:w-40"
              />
              
              <Button 
                onClick={exportToExcel}
                className="bg-green-500 hover:bg-green-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
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
                    <td className="py-3 px-4 font-medium">{record.userName}</td>
                    <td className="py-3 px-4">
                      {new Date(record.date).toLocaleDateString('id-ID', {
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
              <p className="text-gray-600">No attendance records match your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendance;
