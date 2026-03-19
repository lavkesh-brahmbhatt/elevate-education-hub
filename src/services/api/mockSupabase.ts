
import { getStoredData, saveData } from './mockData';

class MockQueryBuilder {
  private table: string;
  private data: any[] = [];
  private filterFuncs: ((row: any) => boolean)[] = [];
  private isInsert = false;
  private isUpdate = false;
  private isDelete = false;
  private values: any = null;
  private limitCount: number | null = null;
  private orderBy: { column: string, ascending: boolean } | null = null;
  private isSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*') {
    // Joins are handled at execution time (in then or single)
    return this;
  }

  insert(values: any | any[]) {
    this.isInsert = true;
    this.values = values;
    return this;
  }

  update(values: any) {
    this.isUpdate = true;
    this.values = values;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  upsert(values: any | any[]) {
    // Handle upsert immediately since it's common in this app
    const db = getStoredData();
    const rows = Array.isArray(values) ? values : [values];
    rows.forEach(r => {
      const tableData = (db as any)[this.table];
      let idx = -1;
      if (this.table === 'attendance') {
        idx = tableData.findIndex((a: any) => a.student_id === r.student_id && a.date === r.date && a.class_id === r.class_id);
      } else if (this.table === 'submissions') {
        idx = tableData.findIndex((s: any) => s.assignment_id === r.assignment_id && s.student_id === r.student_id);
      } else {
        idx = tableData.findIndex((row: any) => row.id === (r.id || 'none'));
      }

      if (idx > -1) {
        tableData[idx] = { ...tableData[idx], ...r, updated_at: new Date().toISOString() };
      } else {
        tableData.push({ id: r.id || crypto.randomUUID(), created_at: new Date().toISOString(), ...r });
      }
    });
    saveData(db);
    return { error: null };
  }

  eq(column: string, value: any) {
    this.filterFuncs.push(row => row[column] === value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filterFuncs.push(row => values.includes(row[column]));
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderBy = { column, ascending };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this; // Supabase single returns a promise usually, but let's make it chainable if needed
  }

  private execute() {
    const db = getStoredData();
    let tableData = (db as any)[this.table] || [];

    if (this.isInsert) {
      const rows = Array.isArray(this.values) ? this.values : [this.values];
      const newRows = rows.map(r => ({ id: r.id || crypto.randomUUID(), created_at: new Date().toISOString(), ...r }));
      tableData.push(...newRows);
      saveData(db);
      return { data: Array.isArray(this.values) ? newRows : newRows[0], error: null };
    }

    if (this.isUpdate) {
      this.filterFuncs.forEach(fn => {
        tableData = tableData.map(row => {
          if (fn(row)) {
            return { ...row, ...this.values, updated_at: new Date().toISOString() };
          }
          return row;
        });
      });
      (db as any)[this.table] = tableData;
      saveData(db);
      return { data: null, error: null };
    }

    if (this.isDelete) {
        this.filterFuncs.forEach(fn => {
            tableData = tableData.filter(row => !fn(row));
        });
        (db as any)[this.table] = tableData;
        saveData(db);
        return { data: null, error: null };
    }

    // Default: Select
    let result = [...tableData];
    
    // Apply filters
    this.filterFuncs.forEach(fn => {
      result = result.filter(fn);
    });

    // Handle joins (very basic)
    if (this.table === 'complaints') {
       result = result.map(c => ({
         ...c,
         profiles: db.profiles.find(p => p.id === c.student_id) || null
       }));
    }
    if (this.table === 'assignments') {
       result = result.map(a => ({
         ...a,
         submissions: db.submissions.filter(s => s.assignment_id === a.id)
       }));
    }
    if (this.table === 'marks') {
       result = result.map(m => ({
         ...m,
         subjects: db.subjects.find(s => s.id === m.subject_id) || null
       }));
    }

    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      result.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: null, count: result.length > 0 ? 1 : 0 };
    }

    return { data: result, error: null, count: result.length };
  }

  // Promise Support
  async then(resolve: any) {
    const res = this.execute();
    resolve(res);
  }
}

export const mockSupabase = {
  auth: {
    async getSession() {
      const stored = localStorage.getItem('mock_session');
      return { data: { session: stored ? JSON.parse(stored) : null }, error: null };
    },
    async signInWithPassword({ email, password }: any) {
      const db = getStoredData();
      const profile = db.profiles.find(p => p.email === email);
      if (profile) {
        const session = { 
          user: { id: profile.id, email: profile.email }, 
          access_token: 'mock-token' 
        };
        localStorage.setItem('mock_session', JSON.stringify(session));
        return { data: { user: session.user, session }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
    },
    async signOut() {
      localStorage.removeItem('mock_session');
      return { error: null };
    },
    onAuthStateChange(callback: any) {
      const sessionStr = localStorage.getItem('mock_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      callback('SIGNED_IN', session);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => new MockQueryBuilder(table)
};
