import mongoose, { Schema, Document } from 'mongoose';

interface ISkill {
  skillName: string;
  skillDetails: string;
}

interface IProject {
  projectName: string;
  projectDescription: string;
  linkToProject: string;
  toolsUsed: string;
}

interface IAward {
  awardName: string;
  awardDate: Date;
  awarder: string;
  awardSummary: string;
}

interface IWorkExperience {
  companyName: string;
  jobTitle: string;
  jobLocation: string;
  startDate: Date;
  endDate: Date;
  responsibilities: string[];
}

interface IEducation {
  schoolName: string;
  degree: string;
  major: string;
  startDate: Date;
  endDate: Date;
}

interface IBasics {
  fullName: string;
  phone?: string;
  location?: string;
  link?: string;
}

interface IResume {
  basics: IBasics;
  education: IEducation[];
  work: IWorkExperience[];
  skills: ISkill[];
  projects: IProject[];
  awards: IAward[];
}

interface IJob {
  company: string;
  position: string;
  summary: string;
  url: string;
  resume: IResume;
}

interface IUserProfile extends Document {
  email: string;
  resume: IResume;
  jobs: IJob[];
}

const skillSchema = new Schema<ISkill>({
  skillName: String,
  skillDetails: String,
});

const projectSchema = new Schema<IProject>({
  projectName: String,
  projectDescription: String,
  linkToProject: String,
  toolsUsed: String,
});

const awardSchema = new Schema<IAward>({
  awardName: String,
  awardDate: Date,
  awarder: String,
  awardSummary: String,
});

const workExperienceSchema = new Schema<IWorkExperience>({
  companyName: String,
  jobTitle: String,
  jobLocation: String,
  startDate: Date,
  endDate: Date,
  responsibilities: [String],
});

const educationSchema = new Schema<IEducation>({
  schoolName: String,
  degree: String,
  major: String,
  startDate: Date,
  endDate: Date,
});

const basicsSchema = new Schema<IBasics>({
  fullName: { type: String, required: true },
  phone: String,
  location: String,
  link: String,
});

const resumeSchema = new Schema<IResume>({
  basics: basicsSchema,
  education: [educationSchema],
  work: [workExperienceSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  awards: [awardSchema],
});

const jobSchema = new Schema<IJob>({
  company: String,
  position: String,
  summary: String,
  url: { type: String, unique: true },
  resume: resumeSchema,
});

const userProfileSchema = new Schema<IUserProfile>({
  email: { type: String, required: true, unique: true },
  resume: resumeSchema,
  jobs: [jobSchema],
});

const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile;
