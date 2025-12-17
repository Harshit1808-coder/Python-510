
import { User, NGO, UserRole, RescueReport, ReportStatus, ChatMessage } from '../types';

// --- Data storage and retrieval from localStorage ---

const USERS_KEY = 'guardian_paws_users';
const NGOS_KEY = 'guardian_paws_ngos';
const REPORTS_KEY = 'guardian_paws_reports';

// Helper to get data from localStorage
const getData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    // Revive dates on load
    if (key === REPORTS_KEY && item) {
        const parsed = JSON.parse(item);
        return parsed.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
            chat: r.chat.map((c: any) => ({...c, timestamp: new Date(c.timestamp)}))
        })) as T;
    }
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// Helper to set data in localStorage
const setData = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

// --- Initial Seed Data ---
const getInitialData = () => {
  let users: User[] = getData(USERS_KEY, []);
  let ngos: NGO[] = getData(NGOS_KEY, []);
  let reports: RescueReport[] = getData(REPORTS_KEY, []);

  if (users.length === 0 && ngos.length === 0 && reports.length === 0) {
    console.log("Seeding initial mock data...");
    
    users = [
      { id: 'user1', name: 'Aarav Sharma', email: 'aarav@test.com', role: UserRole.USER, points: 60 },
    ];

    ngos = [
      { id: 'ngo1', name: 'Animal Angels Rescue', email: 'ngo@test.com', role: UserRole.NGO, location: 'Delhi, India' },
    ];
    
    const now = new Date();
    reports = [
      {
        id: 'report1',
        userId: 'user1',
        animalPhoto: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80',
        description: 'A small kitten seems to have hurt its paw. It is hiding under a car near the market.',
        location: { latitude: 28.6139, longitude: 77.2090 },
        status: ReportStatus.PENDING,
        ngoId: null,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        chat: [],
        geminiAnalysis: `**AI Analysis:**
- **Animal Type:** Domestic Shorthair Kitten.
- **Observed Condition:** Limping, favoring right front paw. Possible sprain or minor fracture.
- **Urgency:** Moderate.
- **First Aid Suggestion:** Do not attempt to move the kitten if it is fearful. Provide water and wait for the NGO.`
      },
      {
        id: 'report2',
        userId: 'user1',
        animalPhoto: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
        description: 'Dog with a collar looks lost and is limping badly near the park.',
        location: { latitude: 28.6315, longitude: 77.2167 },
        status: ReportStatus.RESCUED,
        ngoId: 'ngo1',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        chat: [
          { id: 'msg1', senderId: 'ngo1', text: 'We have received the report and a team is on its way. ETA 20 minutes.', timestamp: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000) },
          { id: 'msg2', senderId: 'user1', text: 'Thank you so much! I will stay nearby and keep an eye on him.', timestamp: new Date(now.getTime() - 1.4 * 24 * 60 * 60 * 1000) },
          { id: 'msg3', senderId: 'ngo1', text: 'We have the dog. He seems okay, just scared. We will check for a microchip. Thank you for your help!', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
        ],
        geminiAnalysis: `**AI Analysis:**
- **Animal Type:** Mixed-breed dog (Possibly Labrador mix).
- **Observed Condition:** Limping on left hind leg. Appears to be a stray but has a collar, suggesting it may be lost.
- **Urgency:** Moderate.
- **First Aid Suggestion:** Approach with caution. If the dog is friendly, check the collar for tags. Provide water.`
      }
    ];

    setData(USERS_KEY, users);
    setData(NGOS_KEY, ngos);
    setData(REPORTS_KEY, reports);
  }

  return { users, ngos, reports };
};

let { users, ngos, reports } = getInitialData();

// --- Utility Functions ---

const generateId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API Functions ---

export const login = async (email: string, password_not_used: string, role: UserRole): Promise<User | NGO> => {
    await delay(500);
    const collection = role === UserRole.USER ? users : ngos;
    const user = collection.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        return user;
    }
    throw new Error('Invalid credentials. Please try again.');
};

export const register = async (formData: Record<string, string>, role: UserRole): Promise<User | NGO> => {
    await delay(500);
    const { name, email, location } = formData;
    if (role === UserRole.USER) {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('An account with this email already exists.');
        }
        const newUser: User = { id: generateId(), name, email, role: UserRole.USER, points: 0 };
        users.push(newUser);
        setData(USERS_KEY, users);
        return newUser;
    } else { // NGO
        if (ngos.some(n => n.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('An account with this email already exists.');
        }
        const newNgo: NGO = { id: generateId(), name, email, role: UserRole.NGO, location: location || 'N/A' };
        ngos.push(newNgo);
        setData(NGOS_KEY, ngos);
        return newNgo;
    }
};

export const getUserById = async (userId: string): Promise<User> => {
  await delay(200);
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  return JSON.parse(JSON.stringify(user));
};

export const createReport = async (reportData: Omit<RescueReport, 'id' | 'userId' | 'status' | 'ngoId' | 'createdAt' | 'updatedAt' | 'chat'>, userId: string): Promise<RescueReport> => {
  await delay(1000);
  const newReport: RescueReport = {
      ...reportData,
      id: generateId(),
      userId,
      status: ReportStatus.PENDING,
      ngoId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      chat: [],
  };
  reports.unshift(newReport); // Add to the beginning of the list
  setData(REPORTS_KEY, reports);

  // Award points for reporting
  const user = users.find(u => u.id === userId);
  if (user) {
      user.points += 10;
      setData(USERS_KEY, users);
  }

  return newReport;
};

export const getReportsByUserId = async (userId: string): Promise<RescueReport[]> => {
    await delay(500);
    return reports.filter(r => r.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getPendingReports = async (): Promise<RescueReport[]> => {
    await delay(500);
    return reports.filter(r => r.status === ReportStatus.PENDING).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getReportsByNgoId = async (ngoId: string): Promise<RescueReport[]> => {
    await delay(500);
    return reports.filter(r => r.ngoId === ngoId && r.status !== ReportStatus.PENDING).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getReportById = async (reportId: string): Promise<RescueReport> => {
    await delay(300);
    const report = reports.find(r => r.id === reportId);
    if (!report) {
        throw new Error('Report not found');
    }
    return JSON.parse(JSON.stringify(report));
};

export const updateReportStatus = async (reportId: string, newStatus: ReportStatus, ngoId: string): Promise<RescueReport> => {
    await delay(500);
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
        throw new Error('Report not found');
    }
    const report = reports[reportIndex];
    report.status = newStatus;
    report.updatedAt = new Date();

    if (newStatus === ReportStatus.ACCEPTED && !report.ngoId) {
        report.ngoId = ngoId;
    }

    if (newStatus === ReportStatus.RESCUED) {
      const user = users.find(u => u.id === report.userId);
      if (user) {
          user.points += 50; // Bonus points for a successful rescue
          setData(USERS_KEY, users);
      }
    }

    reports[reportIndex] = report;
    setData(REPORTS_KEY, reports);
    return report;
};

export const addChatMessage = async (reportId: string, senderId: string, text: string): Promise<ChatMessage> => {
    await delay(200);
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) {
        throw new Error('Report not found');
    }
    const newMessage: ChatMessage = {
        id: generateId(),
        senderId,
        text,
        timestamp: new Date(),
    };
    reports[reportIndex].chat.push(newMessage);
    reports[reportIndex].updatedAt = new Date();
    setData(REPORTS_KEY, reports);

    return newMessage;
};
