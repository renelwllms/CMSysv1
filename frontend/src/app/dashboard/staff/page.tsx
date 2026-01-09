'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { jobRolesService } from '@/services/job-roles.service';
import { staffService } from '@/services/staff.service';
import { shiftsService, ShiftSummary } from '@/services/shifts.service';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  JobRole,
  Shift,
  ShiftStatus,
  StaffMember,
  StaffPayType,
  StaffStatus,
  UserRole,
} from '@/types';
import axios from '@/lib/axios';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toLocalDateTimeString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getWeekRange = (weekStartDay: string) => {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  const offset = weekStartDay === 'SUN' ? day : mondayOffset;
  const monday = new Date(now);
  monday.setDate(now.getDate() - offset);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: formatDate(monday), to: formatDate(sunday) };
};

const getPayRate = (staff: StaffMember) => {
  switch (staff.payType) {
    case StaffPayType.HOURLY:
      return staff.hourlyRate ?? null;
    case StaffPayType.DAILY:
      return staff.dailyRate ?? null;
    case StaffPayType.SALARY:
      return staff.salaryRate ?? null;
    default:
      return null;
  }
};

export default function StaffPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'directory' | 'roster' | 'my'>('directory');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [summary, setSummary] = useState<ShiftSummary[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [range, setRange] = useState(getWeekRange('MON'));
  const [rosterStaffFilter, setRosterStaffFilter] = useState('');
  const [rosterRoleFilter, setRosterRoleFilter] = useState('');
  const [staffSettings, setStaffSettings] = useState({
    staffModuleEnabled: true,
    payTypeOptionsEnabled: ['HOURLY', 'DAILY', 'SALARY'],
    defaultPayType: 'HOURLY',
    shiftTimeGranularity: 30,
    weekStartDay: 'MON',
  });

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    email: '',
    status: StaffStatus.ACTIVE,
    systemRole: UserRole.STAFF,
    payType: StaffPayType.HOURLY,
    hourlyRate: '',
    dailyRate: '',
    salaryRate: '',
    jobRoleIds: [] as string[],
    notes: '',
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({
    staffId: '',
    roleOnShiftId: '',
    startDateTime: '',
    endDateTime: '',
    breakMinutes: 0,
    status: ShiftStatus.SCHEDULED,
    notes: '',
  });

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isStaff = user?.role === 'STAFF';

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (!isLoading && user?.role === 'KITCHEN') {
      router.push('/dashboard/kitchen');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user?.role === 'STAFF') {
      setActiveTab('my');
    }
  }, [user, isLoading]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await axios.get('/settings');
        setStaffSettings({
          staffModuleEnabled: data.staffModuleEnabled ?? true,
          payTypeOptionsEnabled: data.payTypeOptionsEnabled ?? ['HOURLY', 'DAILY', 'SALARY'],
          defaultPayType: data.defaultPayType ?? 'HOURLY',
          shiftTimeGranularity: data.shiftTimeGranularity ?? 30,
          weekStartDay: data.weekStartDay ?? 'MON',
        });
        setRange(getWeekRange(data.weekStartDay ?? 'MON'));
        setStaffForm((prev) => ({
          ...prev,
          payType: (data.defaultPayType as StaffPayType) ?? StaffPayType.HOURLY,
        }));
      } catch (error) {
        console.error('Failed to load staff settings:', error);
      }
    };
    loadSettings();
  }, []);

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const [staff, roles] = await Promise.all([
        staffService.getAll(),
        jobRolesService.getAll(),
      ]);
      setStaffMembers(staff);
      setJobRoles(roles);
    } catch (error) {
      console.error('Failed to load staff directory:', error);
    } finally {
      setStaffLoading(false);
    }
  };

  const loadRoster = async () => {
    setRosterLoading(true);
    try {
      const [shiftData, summaryData] = await Promise.all([
        shiftsService.getAll({
          from: range.from,
          to: range.to,
          staffId: rosterStaffFilter || undefined,
          roleId: rosterRoleFilter || undefined,
        }),
        shiftsService.summary({ from: range.from, to: range.to }),
      ]);
      setShifts(shiftData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load roster data:', error);
    } finally {
      setRosterLoading(false);
    }
  };

  const loadMyShifts = async () => {
    setRosterLoading(true);
    try {
      const shiftData = await shiftsService.getAll({ from: range.from, to: range.to });
      setShifts(shiftData);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if ((isAdmin || isManager) && (activeTab === 'directory' || activeTab === 'roster')) {
      if (!staffSettings.staffModuleEnabled) return;
      loadStaff();
    }
  }, [user, activeTab, isAdmin, isManager, staffSettings.staffModuleEnabled]);

  useEffect(() => {
    if (!user) return;
    if ((isAdmin || isManager) && activeTab === 'roster') {
      if (!staffSettings.staffModuleEnabled) return;
      loadRoster();
    }
    if (isStaff && activeTab === 'my') {
      loadMyShifts();
    }
  }, [
    user,
    activeTab,
    range.from,
    range.to,
    rosterStaffFilter,
    rosterRoleFilter,
    isAdmin,
    isManager,
    isStaff,
    staffSettings.staffModuleEnabled,
  ]);

  const summaryByDate = useMemo(() => {
    const map = new Map<string, ShiftSummary>();
    summary.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [summary]);

  const rosterEvents = useMemo(() => {
    return shifts.map((shift) => {
      const staffName = shift.staff?.displayName || `${shift.staff?.firstName ?? ''} ${shift.staff?.lastName ?? ''}`.trim();
      const roleName = shift.roleOnShift?.name || 'General';
      const title = isStaff ? roleName : `${staffName} - ${roleName}`;
      const statusColor = {
        SCHEDULED: '#f59e0b',
        PUBLISHED: '#10b981',
        COMPLETED: '#6b7280',
        CANCELLED: '#ef4444',
      } as const;
      const color = statusColor[shift.status] || '#6366f1';
      return {
        id: shift.id,
        title,
        start: shift.startDateTime,
        end: shift.endDateTime,
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
        extendedProps: { shift },
      };
    });
  }, [shifts, isStaff]);

  const rosterTotals = useMemo(() => {
    const staffIds = new Set<string>();
    const roleCounts: Record<string, number> = {};
    shifts.forEach((shift) => {
      staffIds.add(shift.staffId);
      const roleName = shift.roleOnShift?.name;
      if (roleName) {
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
      }
    });
    return { staffCount: staffIds.size, roleCounts };
  }, [shifts]);

  const resetStaffForm = () => {
    setStaffForm({
      firstName: '',
      lastName: '',
      displayName: '',
      phone: '',
      email: '',
      status: StaffStatus.ACTIVE,
      systemRole: UserRole.STAFF,
      payType: (staffSettings.defaultPayType as StaffPayType) ?? StaffPayType.HOURLY,
      hourlyRate: '',
      dailyRate: '',
      salaryRate: '',
      jobRoleIds: [],
      notes: '',
    });
  };

  const openStaffModal = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setStaffForm({
        firstName: staff.firstName,
        lastName: staff.lastName,
        displayName: staff.displayName ?? '',
        phone: staff.phone ?? '',
        email: staff.email ?? '',
        status: staff.status,
        systemRole: staff.systemRole,
        payType: staff.payType ?? StaffPayType.HOURLY,
        hourlyRate: staff.hourlyRate?.toString() ?? '',
        dailyRate: staff.dailyRate?.toString() ?? '',
        salaryRate: staff.salaryRate?.toString() ?? '',
        jobRoleIds: staff.jobRoles?.map((role) => role.jobRole.id) ?? [],
        notes: staff.notes ?? '',
      });
    } else {
      setEditingStaff(null);
      resetStaffForm();
    }
    setIsStaffModalOpen(true);
  };

  const saveStaff = async () => {
    try {
      const payload = {
        firstName: staffForm.firstName,
        lastName: staffForm.lastName,
        displayName: staffForm.displayName || undefined,
        phone: staffForm.phone || undefined,
        email: staffForm.email || undefined,
        status: staffForm.status,
        systemRole: staffForm.systemRole,
        payType: staffForm.payType,
        hourlyRate: staffForm.hourlyRate ? Number(staffForm.hourlyRate) : undefined,
        dailyRate: staffForm.dailyRate ? Number(staffForm.dailyRate) : undefined,
        salaryRate: staffForm.salaryRate ? Number(staffForm.salaryRate) : undefined,
        jobRoleIds: staffForm.jobRoleIds,
        notes: staffForm.notes || undefined,
      };

      if (editingStaff) {
        await staffService.update(editingStaff.id, payload);
      } else {
        await staffService.create(payload);
      }
      setIsStaffModalOpen(false);
      resetStaffForm();
      loadStaff();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to save staff member.');
    }
  };

  const toggleStaffStatus = async (staff: StaffMember) => {
    try {
      const nextStatus = staff.status === StaffStatus.ACTIVE ? StaffStatus.INACTIVE : StaffStatus.ACTIVE;
      await staffService.updateStatus(staff.id, nextStatus);
      loadStaff();
    } catch (error) {
      console.error('Failed to update staff status:', error);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await jobRolesService.create(newRoleName.trim());
      setNewRoleName('');
      const roles = await jobRolesService.getAll();
      setJobRoles(roles);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to create role.');
    }
  };

  const removeRole = async (id: string) => {
    try {
      await jobRolesService.remove(id);
      const roles = await jobRolesService.getAll();
      setJobRoles(roles);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to delete role.');
    }
  };

  const resetShiftForm = () => {
    setShiftForm({
      staffId: staffMembers[0]?.id || '',
      roleOnShiftId: '',
      startDateTime: '',
      endDateTime: '',
      breakMinutes: 0,
      status: ShiftStatus.SCHEDULED,
      notes: '',
    });
  };

  const openShiftModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setShiftForm({
        staffId: shift.staffId,
        roleOnShiftId: shift.roleOnShiftId ?? '',
        startDateTime: toDateTimeLocal(shift.startDateTime),
        endDateTime: toDateTimeLocal(shift.endDateTime),
        breakMinutes: shift.breakMinutes ?? 0,
        status: shift.status,
        notes: shift.notes ?? '',
      });
    } else {
      setEditingShift(null);
      resetShiftForm();
    }
    setIsShiftModalOpen(true);
  };

  const saveShift = async () => {
    try {
      const payload = {
        staffId: shiftForm.staffId,
        roleOnShiftId: shiftForm.roleOnShiftId || undefined,
        startDateTime: shiftForm.startDateTime,
        endDateTime: shiftForm.endDateTime,
        breakMinutes: shiftForm.breakMinutes,
        status: shiftForm.status,
        notes: shiftForm.notes || undefined,
      };

      const response = editingShift
        ? await shiftsService.update(editingShift.id, payload)
        : await shiftsService.create(payload);

      if (response.warning) {
        alert(response.warning);
      }

      setIsShiftModalOpen(false);
      resetShiftForm();
      loadRoster();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to save shift.');
    }
  };

  const cancelShift = async (shiftId: string) => {
    try {
      await shiftsService.cancel(shiftId);
      loadRoster();
    } catch (error) {
      console.error('Failed to cancel shift:', error);
    }
  };

  const handleDatesSet = (info: { start: Date; end: Date; view?: { currentStart: Date; currentEnd: Date } }) => {
    const rangeStart = info.view?.currentStart ?? info.start;
    const rangeEnd = new Date(info.view?.currentEnd ?? info.end);
    rangeEnd.setDate(rangeEnd.getDate() - 1);
    setRange({ from: formatDate(rangeStart), to: formatDate(rangeEnd) });
  };

  const handleEventChange = async (info: { event: any; revert: () => void }) => {
    const shift = info.event.extendedProps.shift as Shift | undefined;
    const start = info.event.start as Date | null;
    let end = info.event.end as Date | null;
    if (shift && start && !end) {
      const durationMs =
        new Date(shift.endDateTime).getTime() - new Date(shift.startDateTime).getTime();
      end = new Date(start.getTime() + durationMs);
    }
    if (!shift || !start || !end) {
      info.revert();
      return;
    }

    try {
      const response = await shiftsService.update(shift.id, {
        startDateTime: toLocalDateTimeString(start),
        endDateTime: toLocalDateTimeString(end),
      });
      if (response.warning) {
        alert(response.warning);
      }
      loadRoster();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to update shift.');
      info.revert();
    }
  };

  const handleEventClick = (info: { event: any }) => {
    const shift = info.event.extendedProps.shift as Shift | undefined;
    if (!shift) return;
    if (isAdmin || isManager) {
      openShiftModal(shift);
      return;
    }
    alert(`${shift.roleOnShift?.name || 'General'}\n${formatDateTime(shift.startDateTime)} - ${formatDateTime(shift.endDateTime)}`);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!staffSettings.staffModuleEnabled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Staff & Rostering</h1>
              <span className="text-sm text-gray-600">{user.fullName}</span>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">Staff module is disabled</h2>
            <p className="text-gray-600 mt-2">
              Enable Staff & Rostering in Settings to manage staff profiles and shifts.
            </p>
            {(isAdmin || isManager) && (
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Open Settings
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Staff & Rostering</h1>
            </div>
            <div className="text-sm text-gray-600">{user.fullName}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {(isAdmin || isManager) && (
              <>
                <button
                  onClick={() => setActiveTab('directory')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'directory'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Staff Directory
                </button>
                <button
                  onClick={() => setActiveTab('roster')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'roster'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Roster Calendar
                </button>
              </>
            )}
            {isStaff && (
              <button
                onClick={() => setActiveTab('my')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Shifts
              </button>
            )}
          </nav>
        </div>

        {activeTab === 'directory' && (isAdmin || isManager) && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Staff Directory</h2>
                <p className="text-sm text-gray-500">Add, edit, and manage staff profiles.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Manage Roles
                </button>
                <button
                  onClick={() => openStaffModal()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Add Staff
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {staffLoading ? (
                <div className="p-8 text-center text-gray-500">Loading staff...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Job Roles</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Pay</th>
                      <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staffMembers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                          No staff members added yet.
                        </td>
                      </tr>
                    )}
                    {staffMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {member.displayName || `${member.firstName} ${member.lastName}`}
                          </div>
                          <div className="text-xs text-gray-500">{member.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{member.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              member.status === StaffStatus.ACTIVE
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {member.status === StaffStatus.ACTIVE ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {member.jobRoles?.length
                            ? member.jobRoles.map((role) => role.jobRole.name).join(', ')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {member.payType ? `${member.payType} (${getPayRate(member) ?? '-'})` : 'Not set'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => openStaffModal(member)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStaffStatus(member)}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            {member.status === StaffStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'roster' && (isAdmin || isManager) && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Roster Calendar</h2>
                <p className="text-sm text-gray-500">Plan shifts and publish rosters.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      await shiftsService.publish(range.from, range.to);
                      loadRoster();
                    } catch (error: any) {
                      alert(error?.response?.data?.message || 'Failed to publish shifts.');
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Publish Range
                </button>
                <button
                  onClick={() => openShiftModal()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Create Shift
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {range.from} to {range.to}
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Staff</label>
                    <select
                      value={rosterStaffFilter}
                      onChange={(e) => setRosterStaffFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">All staff</option>
                      {staffMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.displayName || `${member.firstName} ${member.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                    <select
                      value={rosterRoleFilter}
                      onChange={(e) => setRosterRoleFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">All roles</option>
                      {jobRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Times should align to {staffSettings.shiftTimeGranularity}-minute increments.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-500">Total staff scheduled</div>
                  <div className="text-2xl font-semibold text-gray-900">{rosterTotals.staffCount}</div>
                </div>
                {Object.keys(rosterTotals.roleCounts).length > 0 && (
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {Object.entries(rosterTotals.roleCounts).map(([role, count]) => (
                      <div key={role} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <span>{role}</span>
                        <span className="font-semibold text-gray-700">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              {rosterLoading && shifts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Loading roster...</div>
              ) : null}
              {!rosterLoading && shifts.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No shifts scheduled for this range.</div>
              ) : null}
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="auto"
                firstDay={staffSettings.weekStartDay === 'SUN' ? 0 : 1}
                events={rosterEvents}
                editable={isAdmin || isManager}
                selectable={isAdmin || isManager}
                selectMirror
                dayMaxEvents={3}
                slotDuration={{ minutes: staffSettings.shiftTimeGranularity }}
                snapDuration={{ minutes: staffSettings.shiftTimeGranularity }}
                datesSet={handleDatesSet}
                select={(info) => {
                  if (!isAdmin && !isManager) return;
                  let startDate = info.start;
                  let endDate = info.end;
                  if (info.allDay) {
                    const dayStart = new Date(info.start);
                    dayStart.setHours(9, 0, 0, 0);
                    const dayEnd = new Date(info.start);
                    dayEnd.setHours(17, 0, 0, 0);
                    startDate = dayStart;
                    endDate = dayEnd;
                  }
                  setEditingShift(null);
                  setShiftForm((prev) => ({
                    ...prev,
                    staffId: prev.staffId || staffMembers[0]?.id || '',
                    startDateTime: toLocalDateTimeString(startDate),
                    endDateTime: toLocalDateTimeString(endDate),
                    status: ShiftStatus.SCHEDULED,
                  }));
                  setIsShiftModalOpen(true);
                }}
                eventClick={handleEventClick}
                eventDrop={handleEventChange}
                eventResize={handleEventChange}
                dayCellContent={(arg) => {
                  if (arg.view.type !== 'dayGridMonth') {
                    return <span className="fc-daygrid-day-number">{arg.dayNumberText}</span>;
                  }
                  const key = formatDate(arg.date);
                  const count = summaryByDate.get(key)?.staffCount ?? 0;
                  return (
                    <div className="flex flex-col">
                      <span className="fc-daygrid-day-number">{arg.dayNumberText}</span>
                      {count > 0 && <span className="text-xs text-indigo-600 mt-1">{count} staff</span>}
                    </div>
                  );
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'my' && isStaff && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Shifts</h2>
              <p className="text-sm text-gray-500">Your upcoming published shifts.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              {rosterLoading && shifts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Loading shifts...</div>
              ) : null}
              {!rosterLoading && shifts.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No shifts scheduled for this range.</div>
              ) : null}
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="auto"
                firstDay={staffSettings.weekStartDay === 'SUN' ? 0 : 1}
                events={rosterEvents}
                editable={false}
                selectable={false}
                dayMaxEvents={3}
                slotDuration={{ minutes: staffSettings.shiftTimeGranularity }}
                snapDuration={{ minutes: staffSettings.shiftTimeGranularity }}
                datesSet={handleDatesSet}
                eventClick={handleEventClick}
              />
            </div>
          </div>
        )}
      </main>

      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStaff ? 'Edit Staff' : 'Add Staff'}
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                X
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                value={staffForm.firstName}
                onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Last name"
                value={staffForm.lastName}
                onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Display name"
                value={staffForm.displayName}
                onChange={(e) => setStaffForm({ ...staffForm, displayName: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Phone"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={staffForm.systemRole}
                onChange={(e) => setStaffForm({ ...staffForm, systemRole: e.target.value as UserRole })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={UserRole.STAFF}>Staff</option>
                <option value={UserRole.MANAGER}>Manager</option>
                {isAdmin && <option value={UserRole.ADMIN}>Admin</option>}
              </select>
              <select
                value={staffForm.payType}
                onChange={(e) => setStaffForm({ ...staffForm, payType: e.target.value as StaffPayType })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {staffSettings.payTypeOptionsEnabled.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Hourly rate"
                value={staffForm.hourlyRate}
                onChange={(e) => setStaffForm({ ...staffForm, hourlyRate: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Daily rate"
                value={staffForm.dailyRate}
                onChange={(e) => setStaffForm({ ...staffForm, dailyRate: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Salary rate (monthly)"
                value={staffForm.salaryRate}
                onChange={(e) => setStaffForm({ ...staffForm, salaryRate: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-2">Job roles</label>
                <div className="flex flex-wrap gap-3">
                  {jobRoles.map((role) => (
                    <label key={role.id} className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={staffForm.jobRoleIds.includes(role.id)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...staffForm.jobRoleIds, role.id]
                            : staffForm.jobRoleIds.filter((id) => id !== role.id);
                          setStaffForm({ ...staffForm, jobRoleIds: next });
                        }}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Notes"
                value={staffForm.notes}
                onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveStaff}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Save Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Job Roles</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                X
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New role name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={createRole}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {jobRoles.map((role) => (
                <div key={role.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700">{role.name}</span>
                  <button
                    onClick={() => removeRole(role.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {jobRoles.length === 0 && <p className="text-sm text-gray-500">No roles yet.</p>}
            </div>
          </div>
        </div>
      )}

      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingShift ? 'Edit Shift' : 'Create Shift'}
              </h3>
              <button onClick={() => setIsShiftModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                X
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={shiftForm.staffId}
                onChange={(e) => setShiftForm({ ...shiftForm, staffId: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select staff</option>
                {staffMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName || `${member.firstName} ${member.lastName}`}
                  </option>
                ))}
              </select>
              <select
                value={shiftForm.roleOnShiftId}
                onChange={(e) => setShiftForm({ ...shiftForm, roleOnShiftId: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Role on shift (optional)</option>
                {jobRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={shiftForm.startDateTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startDateTime: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={shiftForm.endDateTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endDateTime: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={0}
                value={shiftForm.breakMinutes}
                onChange={(e) => setShiftForm({ ...shiftForm, breakMinutes: Number(e.target.value) })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Break minutes"
              />
              <select
                value={shiftForm.status}
                onChange={(e) => setShiftForm({ ...shiftForm, status: e.target.value as ShiftStatus })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={ShiftStatus.SCHEDULED}>Draft</option>
                <option value={ShiftStatus.PUBLISHED}>Published</option>
                <option value={ShiftStatus.COMPLETED}>Completed</option>
                <option value={ShiftStatus.CANCELLED}>Cancelled</option>
              </select>
              <textarea
                placeholder="Notes"
                value={shiftForm.notes}
                onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveShift}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
              >
                Save Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
