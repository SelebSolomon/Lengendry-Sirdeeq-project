export interface RegisterDto {
  userName: string;
  DOB: Date;
  gender: "Male" | "Female";
  email: string;
  phone?: string;
  password: string;
}

export interface LoginIdentifierDto {
  email?: string;
  userName?: string;
  phone?: string;
}

export interface UpdatePasswordDto {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
