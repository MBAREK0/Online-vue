// work-experiences.component.ts
import { Component, OnInit } from '@angular/core';
import { WorkExperience } from "../../core/models/WorkExperience";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkExperienceService } from "../../core/services/work-experience.service";
import { CommonModule } from "@angular/common";

interface LanguageInfo {
  code: string;
  name: string;
}

@Component({
  selector: 'app-work-experiences',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './work-experiences.component.html',
  styleUrl: './work-experiences.component.css'
})
export class WorkExperienceComponent implements OnInit {
  // Properties for form handling
  workExperienceForm!: FormGroup;
  selectedFile: File | null = null;
  submitted = false;
  skills: string[] = []; // Array to hold the skill tags

  // Language management
  languages: LanguageInfo[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];
  currentLanguageIndex = 0;

  // Storage for saved forms
  savedForms: WorkExperience[] = [];

  // Map to store skills for each language
  languageSkillsMap: Map<string, string[]> = new Map();

  constructor(
    private workExperienceService: WorkExperienceService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setLanguageCode(this.languages[0].code);
  }

  // Getter for form controls - to use in template for validation
  get f() {
    return this.workExperienceForm.controls;
  }

  // Initialize form with validators
  initForm() {
    this.workExperienceForm = this.fb.group({
      userId: [1, Validators.required], // Hard-coded for example; should come from auth service
      languageCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(255)]],
      companyName: ['', [Validators.required, Validators.maxLength(255)]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['', Validators.maxLength(2000)]
      // Skills are handled separately through the skills array
    });
  }

  // Add a skill tag
  addSkill(skill: string) {
    if (skill && skill.trim() !== '' && !this.skills.includes(skill.trim())) {
      this.skills.push(skill.trim());

      // Save skills for current language
      this.saveSkillsForCurrentLanguage();
    }
  }

  // Remove a skill tag
  removeSkill(index: number) {
    if (index >= 0 && index < this.skills.length) {
      this.skills.splice(index, 1);

      // Save skills for current language
      this.saveSkillsForCurrentLanguage();
    }
  }

  // Save skills for the current language
  saveSkillsForCurrentLanguage() {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;
    this.languageSkillsMap.set(currentLangCode, [...this.skills]);
  }

  // Load skills for a language
  loadSkillsForLanguage(languageCode: string) {
    const savedSkills = this.languageSkillsMap.get(languageCode) || [];
    this.skills = [...savedSkills];
  }

  // File input handler - only required for English form
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Handle form submission for current language
  submitCurrentForm() {
    this.submitted = true;

    // Check if form is valid
    if (this.workExperienceForm.invalid) {
      return;
    }

    // For the first form (English), check if the logo is uploaded
    if (this.currentLanguageIndex === 0 && !this.selectedFile) {
      return; // Logo is required for English form
    }

    // Check if at least one skill is added
    if (this.skills.length === 0) {
      return;
    }

    // Create a copy of the form value and add skills
    const formValue = { ...this.workExperienceForm.value } as WorkExperience;
    formValue.skills = [...this.skills];

    // Find if we already have a form saved for this language
    const existingIndex = this.savedForms.findIndex(
      form => form.languageCode === formValue.languageCode
    );

    if (existingIndex >= 0) {
      // Update existing entry
      this.savedForms[existingIndex] = formValue;
    } else {
      // Add new entry
      this.savedForms.push(formValue);
    }

    // Save skills for current language
    this.saveSkillsForCurrentLanguage();

    // If this is the last language, submit all forms
    if (this.isLastLanguage()) {
      this.submitAllForms();
    } else {
      // Move to next language
      this.nextLanguage();
    }

    this.submitted = false;
  }

  // Navigation methods
  nextLanguage() {
    if (this.currentLanguageIndex < this.languages.length - 1) {
      this.currentLanguageIndex++;
      this.loadLanguageForm(this.currentLanguageIndex);
    }
  }

  previousLanguage() {
    if (this.currentLanguageIndex > 0) {
      this.currentLanguageIndex--;
      this.loadLanguageForm(this.currentLanguageIndex);
    }
  }

  // Check if current language is last
  isLastLanguage(): boolean {
    return this.currentLanguageIndex === this.languages.length - 1;
  }

  // Get current language name for display
  getCurrentLanguageName(): string {
    return this.languages[this.currentLanguageIndex].name;
  }

  // Get language name by code
  getLanguageName(code: string): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.name : code;
  }

  // Set current language code in form
  setLanguageCode(code: string) {
    this.workExperienceForm.patchValue({ languageCode: code });
  }

  // Load form data for a specific language
  loadLanguageForm(index: number) {
    const languageCode = this.languages[index].code;
    this.setLanguageCode(languageCode);

    // Load skills for this language
    this.loadSkillsForLanguage(languageCode);

    // Check if we have already saved data for this language
    const savedForm = this.savedForms.find(form => form.languageCode === languageCode);

    if (savedForm) {
      // Load saved form data
      this.workExperienceForm.patchValue({
        userId: savedForm.userId,
        languageCode: savedForm.languageCode,
        jobTitle: savedForm.jobTitle,
        companyName: savedForm.companyName,
        location: savedForm.location,
        startDate: savedForm.startDate,
        endDate: savedForm.endDate,
        description: savedForm.description
      });

      // Load skills
      this.skills = savedForm.skills || [];
    } else {
      // Reset form but keep language code and user ID
      const userId = this.workExperienceForm.get('userId')?.value;
      this.workExperienceForm.reset({ userId, languageCode });
    }
  }

  // Edit a previously saved form
  editSavedForm(index: number) {
    const form = this.savedForms[index];
    const langIndex = this.languages.findIndex(lang => lang.code === form.languageCode);

    if (langIndex >= 0) {
      this.currentLanguageIndex = langIndex;
      this.loadLanguageForm(langIndex);
    }
  }

  // Submit all saved forms to the backend
  submitAllForms() {
    if (this.savedForms.length === 0 || !this.selectedFile) {
      return;
    }

    this.workExperienceService.createWorkExperience(this.savedForms, this.selectedFile).subscribe(
      (data) => {
        // Success - clear the form and saved data
        this.savedForms = [];
        this.workExperienceForm.reset();
        this.selectedFile = null;
        this.currentLanguageIndex = 0;
        this.skills = [];
        this.languageSkillsMap.clear();
        this.initForm();
        this.setLanguageCode(this.languages[0].code);

        // Show success message
        alert('Work experiences saved successfully!');
      },
      (error) => {
        console.error('Error creating work experiences', error);
        alert('Error saving work experiences. Please try again.');
      }
    );
  }
}
