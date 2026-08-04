import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { CONFIG } from './config.ts';
import {
  UserWithPassword,
  User,
  TerritorioRecord,
  Role,
  StatsSummary,
  BackupData,
  TipoEdificacion,
} from '../src/types.ts';

interface DatabaseSchema {
  version: string;
  users: UserWithPassword[];
  records: TerritorioRecord[];
}

class Database {
  private data: DatabaseSchema;
  private filePath: string;

  constructor() {
    this.filePath = CONFIG.dbFilePath;
    this.data = {
      version: '1.0.0',
      users: [],
      records: [],
    };
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      this.filePath = '/tmp/territorio_mix_db.json';
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          version: parsed.version || '1.0.0',
          users: Array.isArray(parsed.users) ? parsed.users : [],
          records: Array.isArray(parsed.records) ? parsed.records : [],
        };
      } catch (err) {
        console.error('Error reading DB file, re-initializing seed data:', err);
        this.seedInitialData();
        return;
      }
    } else {
      this.seedInitialData();
      return;
    }

    // Ensure users array contains ONLY the single 'administrador' account if not already configured correctly
    const adminUser = this.data.users.find(
      (u) => u.name.toLowerCase() === 'administrador' || u.email.toLowerCase() === 'gonzalez.exe@mendoza.edu.ar'
    );

    if (!adminUser) {
      this.seedInitialData();
    }
  }

  private save() {
    try {
      let targetPath = this.filePath;
      let dir = path.dirname(targetPath);
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch {
        targetPath = '/tmp/territorio_mix_db.json';
        this.filePath = targetPath;
        dir = '/tmp';
      }
      const tmpPath = `${targetPath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, targetPath);
    } catch (error) {
      console.error('Failed to save DB:', error);
    }
  }

  private seedInitialData() {
    const defaultAdmin: UserWithPassword = {
      id: 'admin-seed-001',
      name: 'administrador',
      email: 'gonzalez.exe@mendoza.edu.ar',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
      passwordHash: '',
      needsPasswordSetup: true,
    };

    const initialRecords: TerritorioRecord[] = [
      {
        id: 'rec-101',
        territorio: '54',
        manzana: '2',
        calle: 'Av. San Martín',
        numeracion: '1045',
        calleNumeracion: 'Av. San Martín 1045',
        tipoEdificacion: 'Departamentos',
        pisos: '6',
        cantidadDepartamentos: '12',
        porteriaVigilancia: 'Sí (24 hs)',
        observaciones: 'Edificio de 6 pisos con 12 departamentos y local en planta baja.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        createdBy: defaultAdmin.id,
        createdByName: defaultAdmin.name,
        createdByEmail: defaultAdmin.email,
      },
      {
        id: 'rec-102',
        territorio: '54',
        manzana: '3',
        calle: 'Sarmiento',
        numeracion: '430',
        calleNumeracion: 'Sarmiento 430',
        tipoEdificacion: 'Escuela primaria',
        observaciones: 'Escuela pública estatal "General Belgrano", turno mañana y tarde.',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        createdBy: defaultAdmin.id,
        createdByName: defaultAdmin.name,
        createdByEmail: defaultAdmin.email,
      },
      {
        id: 'rec-103',
        territorio: '55',
        manzana: '1',
        calle: 'Calle Las Heras',
        numeracion: '890',
        calleNumeracion: 'Calle Las Heras 890',
        tipoEdificacion: 'Centro de salud',
        observaciones: 'Centro de atención primaria municipal, guardia diurna.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        createdBy: defaultAdmin.id,
        createdByName: defaultAdmin.name,
        createdByEmail: defaultAdmin.email,
      },
    ];

    this.data = {
      version: '1.0.0',
      users: [defaultAdmin],
      records: initialRecords,
    };

    this.save();
  }

  // ---- USERS METHODS ----
  public getAllUsers(): User[] {
    return this.data.users.map(({ passwordHash, resetToken, resetTokenExpiry, needsPasswordSetup, ...user }) => user);
  }

  public getUserByEmail(emailOrUsername: string): UserWithPassword | undefined {
    const query = emailOrUsername.trim().toLowerCase();
    return this.data.users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        u.name.toLowerCase() === query
    );
  }

  public getUserById(id: string): UserWithPassword | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }): User {
    const newUser: UserWithPassword = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'user',
      active: true,
      createdAt: new Date().toISOString(),
      passwordHash: userData.passwordHash,
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash, resetToken, resetTokenExpiry, ...user } = newUser;
    return user;
  }

  public updateUserRole(id: string, role: Role, active?: boolean): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx].role = role;
    if (typeof active === 'boolean') {
      this.data.users[idx].active = active;
    }
    this.save();
    const { passwordHash, resetToken, resetTokenExpiry, ...user } = this.data.users[idx];
    return user;
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public setResetToken(email: string, token: string, expiry: number): boolean {
    const user = this.getUserByEmail(email);
    if (!user) return false;
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.save();
    return true;
  }

  public getUserByResetToken(token: string): UserWithPassword | undefined {
    const now = Date.now();
    return this.data.users.find(
      (u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > now
    );
  }

  public resetUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    this.save();
    return true;
  }

  // ---- RECORDS METHODS ----
  public getAllRecords(): TerritorioRecord[] {
    return [...this.data.records].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getRecordById(id: string): TerritorioRecord | undefined {
    return this.data.records.find((r) => r.id === id);
  }

  public createRecord(
    data: {
      territorio: string;
      manzana: string;
      calle?: string;
      numeracion?: string;
      calleNumeracion?: string;
      tipoEdificacion: TipoEdificacion;
      pisos?: string;
      cantidadDepartamentos?: string;
      porteriaVigilancia?: string;
      observaciones?: string;
    },
    user: User
  ): TerritorioRecord {
    const calleStr = (data.calle || '').trim();
    const numStr = (data.numeracion || '').trim();
    const computedCalleNum =
      data.calleNumeracion?.trim() || `${calleStr} ${numStr}`.trim();

    const newRecord: TerritorioRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      territorio: data.territorio.trim(),
      manzana: data.manzana.trim(),
      calle: calleStr || undefined,
      numeracion: numStr || undefined,
      calleNumeracion: computedCalleNum,
      tipoEdificacion: data.tipoEdificacion,
      pisos: data.pisos ? data.pisos.trim() : undefined,
      cantidadDepartamentos: data.cantidadDepartamentos ? data.cantidadDepartamentos.trim() : undefined,
      porteriaVigilancia: data.porteriaVigilancia ? data.porteriaVigilancia.trim() : undefined,
      observaciones: data.observaciones ? data.observaciones.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
      createdByName: user.name,
      createdByEmail: user.email,
    };
    this.data.records.push(newRecord);
    this.save();
    return newRecord;
  }

  public updateRecord(
    id: string,
    updates: Partial<{
      territorio: string;
      manzana: string;
      calle?: string;
      numeracion?: string;
      calleNumeracion?: string;
      tipoEdificacion: TipoEdificacion;
      pisos?: string;
      cantidadDepartamentos?: string;
      porteriaVigilancia?: string;
      observaciones?: string;
    }>
  ): TerritorioRecord | null {
    const idx = this.data.records.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const current = this.data.records[idx];
    const newCalle = updates.calle !== undefined ? updates.calle.trim() : current.calle;
    const newNum = updates.numeracion !== undefined ? updates.numeracion.trim() : current.numeracion;
    const computedCalleNum = updates.calleNumeracion !== undefined
      ? updates.calleNumeracion.trim()
      : `${newCalle || ''} ${newNum || ''}`.trim() || current.calleNumeracion;

    this.data.records[idx] = {
      ...current,
      ...updates,
      calle: newCalle || undefined,
      numeracion: newNum || undefined,
      calleNumeracion: computedCalleNum,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.records[idx];
  }

  public deleteRecord(id: string): boolean {
    const initialLen = this.data.records.length;
    this.data.records = this.data.records.filter((r) => r.id !== id);
    if (this.data.records.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ---- STATS METHODS ----
  public getStats(): StatsSummary {
    const totalRecords = this.data.records.length;
    const totalUsers = this.data.users.length;

    const tipoCounts: Record<string, number> = {};
    const territorioCounts: Record<string, number> = {};

    this.data.records.forEach((rec) => {
      const tipo = rec.tipoEdificacion || 'Otro';
      tipoCounts[tipo] = (tipoCounts[tipo] || 0) + 1;

      const terr = rec.territorio || 'Sin especificar';
      territorioCounts[terr] = (territorioCounts[terr] || 0) + 1;
    });

    const byTipoEdificacion = Object.entries(tipoCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const byTerritorio = Object.entries(territorioCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const sevenDaysAgo = Date.now() - 86400000 * 7;
    const recentRecordsCount = this.data.records.filter(
      (r) => new Date(r.createdAt).getTime() >= sevenDaysAgo
    ).length;

    return {
      totalRecords,
      byTipoEdificacion,
      byTerritorio,
      totalUsers,
      recentRecordsCount,
    };
  }

  // ---- BACKUP AND RESTORE ----
  public exportBackup(): BackupData {
    return {
      version: this.data.version,
      timestamp: new Date().toISOString(),
      records: this.data.records,
      users: this.data.users,
    };
  }

  public restoreBackup(backup: BackupData): {
    success: boolean;
    recordsRestored: number;
    usersRestored: number;
    message: string;
  } {
    if (!backup || !Array.isArray(backup.records) || !Array.isArray(backup.users)) {
      throw new Error('Archivo de backup inválido. Debe contener arreglos de "records" y "users".');
    }

    // Merge/replace records & users
    const recordMap = new Map<string, TerritorioRecord>();
    this.data.records.forEach((r) => recordMap.set(r.id, r));
    backup.records.forEach((r) => {
      if (r.id && r.territorio && r.manzana && r.calleNumeracion && r.tipoEdificacion) {
        recordMap.set(r.id, r);
      }
    });

    const userMap = new Map<string, UserWithPassword>();
    this.data.users.forEach((u) => userMap.set(u.email.toLowerCase(), u));
    backup.users.forEach((u) => {
      if (u.id && u.email && u.passwordHash) {
        userMap.set(u.email.toLowerCase(), u);
      }
    });

    this.data.records = Array.from(recordMap.values());
    this.data.users = Array.from(userMap.values());
    this.save();

    return {
      success: true,
      recordsRestored: this.data.records.length,
      usersRestored: this.data.users.length,
      message: `Restauración exitosa: ${this.data.records.length} registros y ${this.data.users.length} usuarios en la base de datos.`,
    };
  }
}

export const db = new Database();
