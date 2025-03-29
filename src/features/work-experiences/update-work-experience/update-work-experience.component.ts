import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkExperienceRequest } from "../../../core/vm/work-experience/WorkExperienceRequest";
import { WorkExperienceService } from "../../../core/services/work-experience.service";
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { AppState, PortfolioTranslationLanguages } from "../../../shared/state/app.reducer";
import { Store } from "@ngrx/store";
import { selectUserPortfolioLanguages } from "../../../shared/state/app.selectors";
import { animate, style, transition, trigger } from "@angular/animations";
import { ActivatedRoute, Router } from "@angular/router";
import {WorkExperienceResponse} from "../../../core/vm/work-experience/WorkExperienceResponse";

@Component({
  selector: 'app-update-work-experience',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './update-work-experience.component.html',
  styleUrl: './update-work-experience.component.css',
  animations: [
    trigger('modalState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class UpdateWorkExperienceComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  workExperienceForm!: FormGroup;
  selectedFiles: { [key: string]: File | null } = {};
  submitted = false;
  skills: string[] = [];
  translating: boolean = false;
  loading: boolean = true;

  languages: PortfolioTranslationLanguages[] = [];
  currentLanguageIndex = 0;
  primaryLanguageIndex = 0;

  savedForms: WorkExperienceResponse[] = [];
  errorMessage: string | null = null;
  isErrorModalVisible = false;
  experienceId: string = '';

  languageSkillsMap: Map<string, string[]> = new Map();
  originalPrimaryTexts: Map<string, string | string[]> = new Map();
  existingCompanyLogo: string | null = null;

  constructor(
    private workExperienceService: WorkExperienceService,
    private fb: FormBuilder,
    private http: HttpClient,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.experienceId = params['id'];

      this.store.select(selectUserPortfolioLanguages).subscribe((langs) => {
        if (langs && langs.length > 0) {
          this.languages = langs;

          this.primaryLanguageIndex = this.languages.findIndex(lang => lang.primary);
          if (this.primaryLanguageIndex === -1) {
            this.primaryLanguageIndex = 0;
            this.languages[0].primary = true;
          }

          this.initForm();
          this.currentLanguageIndex = this.primaryLanguageIndex;
          this.fetchWorkExperienceData();
        }
      });
    });
  }

  fetchWorkExperienceData() {
    this.loading = true;
    // Create a method in your service to fetch work experience by ID
    this.workExperienceService.fetchWorkExperienceById(this.experienceId)
      .subscribe({
        next: (data) => {
          this.savedForms = data;

          // Store the existing company logo
          const primaryExperience = data.find(exp =>
            exp.languageCode === this.languages[this.primaryLanguageIndex].code);

          if (primaryExperience && primaryExperience.companyLogo) {
            this.existingCompanyLogo = primaryExperience.companyLogo;
          }

          // Initialize skills map
          data.forEach(exp => {
            if (exp.skills) {
              this.languageSkillsMap.set(exp.languageCode, [...exp.skills]);
            }
          });

          // Store primary language texts for translation
          const primaryExp = data.find(exp =>
            exp.languageCode === this.languages[this.primaryLanguageIndex].code);

          if (primaryExp) {
            this.originalPrimaryTexts.set('jobTitle', primaryExp.jobTitle);
            this.originalPrimaryTexts.set('location', primaryExp.location);
            this.originalPrimaryTexts.set('description', primaryExp.description || '');
            this.originalPrimaryTexts.set('skills', primaryExp.skills || []);
            this.originalPrimaryTexts.set('companyName', primaryExp.companyName);
          }

          this.loadLanguageForm(this.currentLanguageIndex);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching work experience data', error);
          this.showErrorModal('Failed to load work experience data. Please try again.');
          this.loading = false;
        }
      });
  }

  get f() {
    return this.workExperienceForm.controls;
  }

  initForm() {
    this.workExperienceForm = this.fb.group({
      userId: [this.getUserIdFromStorage(), Validators.required],
      experienceId: [this.experienceId, Validators.required],
      languageCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(5)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(255)]],
      companyName: ['', [Validators.required, Validators.maxLength(255)]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['', Validators.maxLength(2000)]
    });
  }

  getUserIdFromStorage(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 1;
  }

  onFileChange(event: any) {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;

    if (event.target.files.length > 0) {
      this.selectedFiles[currentLangCode] = event.target.files[0];
    } else {
      delete this.selectedFiles[currentLangCode];
    }
  }

  clearSelectedFile() {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;
    delete this.selectedFiles[currentLangCode];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  addSkill(skill: string) {
    if (skill && skill.trim() !== '' && !this.skills.includes(skill.trim())) {
      this.skills.push(skill.trim());
      this.saveSkillsForCurrentLanguage();

      if (this.currentLanguageIndex === this.primaryLanguageIndex) {
        const originalSkills = this.originalPrimaryTexts.get('skills') as string[] || [];
        originalSkills.push(skill.trim());
        this.originalPrimaryTexts.set('skills', originalSkills);
      }
    }
  }

  removeSkill(index: number) {
    if (index >= 0 && index < this.skills.length) {
      this.skills.splice(index, 1);
      this.saveSkillsForCurrentLanguage();

      if (this.currentLanguageIndex === this.primaryLanguageIndex) {
        const originalSkills = this.originalPrimaryTexts.get('skills') as string[] || [];
        originalSkills.splice(index, 1);
        this.originalPrimaryTexts.set('skills', originalSkills);
      }
    }
  }

  saveSkillsForCurrentLanguage() {
    const currentLangCode = this.languages[this.currentLanguageIndex].code;
    this.languageSkillsMap.set(currentLangCode, [...this.skills]);
  }

  loadSkillsForLanguage(languageCode: string) {
    const savedSkills = this.languageSkillsMap.get(languageCode) || [];
    this.skills = [...savedSkills];
  }

  submitCurrentForm() {
    this.submitted = true;

    // For non-primary languages, patch certain fields from primary language
    if (this.currentLanguageIndex !== this.primaryLanguageIndex) {
      const primaryForm = this.savedForms.find(form =>
        form.languageCode === this.languages[this.primaryLanguageIndex].code
      );

      if (primaryForm) {
        this.workExperienceForm.patchValue({
          companyName: primaryForm.companyName,
          startDate: primaryForm.startDate,
          endDate: primaryForm.endDate
        });
      }
    }

    if (this.workExperienceForm.invalid || this.skills.length === 0) {
      return;
    }

    // Create form value with skills
    const formValue = {
      ...this.workExperienceForm.value,
      skills: [...this.skills]
    } as WorkExperienceResponse;

    const existingIndex = this.savedForms.findIndex(
      form => form.languageCode === formValue.languageCode
    );

    if (existingIndex >= 0) {
      this.savedForms[existingIndex] = {
        ...this.savedForms[existingIndex],
        ...formValue
      };
    } else {
      this.savedForms.push(formValue);
    }

    if (this.currentLanguageIndex === this.primaryLanguageIndex) {
      this.originalPrimaryTexts.set('jobTitle', formValue.jobTitle);
      this.originalPrimaryTexts.set('location', formValue.location);
      this.originalPrimaryTexts.set('description', formValue.description ?? '');
      this.originalPrimaryTexts.set('skills', [...this.skills]);
      this.originalPrimaryTexts.set('companyName', formValue.companyName);
    }

    this.saveSkillsForCurrentLanguage();

    if (this.isLastLanguage()) {
      this.submitAllForms();
    } else {
      this.nextLanguage();
    }

    this.submitted = false;
  }

  submitAllForms() {
    if (this.savedForms.length === 0) {
      return;
    }


    const primaryLangCode = this.languages[this.primaryLanguageIndex].code;
    const logoFile = this.selectedFiles[primaryLangCode] || null;

    // Convert forms to JSON string for request
    const workExperiencesJson = JSON.stringify(this.savedForms);

    console.log(this.savedForms);
    // Update work experience with the service
    // First implement the method in the service
    this.updateWorkExperience(this.experienceId, workExperiencesJson, logoFile);
  }

  updateWorkExperience(experienceId: string, workExperiencesJson: string, logoFile: File | null) {
    // Parse the saved forms to reformat them
    const workExperiences: WorkExperienceResponse[] = JSON.parse(workExperiencesJson);

    // Convert each form to match WorkExperienceRequestVM structure
    const requestData = workExperiences.map(exp => {
      // Convert dates to LocalDate format (YYYY-MM-DD)
      const startDate = exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '';
      const endDate = exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '';

      return {
        userId: exp.userId || this.getUserIdFromStorage(),
        experienceId: exp.experienceId ? exp.experienceId : experienceId,
        languageCode: exp.languageCode,
        jobTitle: exp.jobTitle,
        companyName: exp.companyName,
        location: exp.location,
        startDate: startDate,
        endDate: endDate || null, // Send null if no end date
        description: exp.description || '',
        skills: exp.skills || []
      };
    });

    const formData = new FormData();

    // Add the JSON string of reformatted data
    formData.append('workExperiences', JSON.stringify(requestData));

    // Add the file if it exists
    if (logoFile) {
      formData.append('companyLogoFile', logoFile);
    }

    this.http.put<WorkExperienceRequest[]>(
      `${this.workExperienceService['apiUrl']}/${experienceId}`,
      formData
    ).subscribe({
      next: () => {
        this.showErrorModal('Work experience updated successfully!', true);
        setTimeout(() => {
          this.router.navigate(['/portfolio/work-experiences']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating work experience', error);
        let errorMsg = 'Error updating work experience. Please try again.';
        if (error.error instanceof ErrorEvent) {
          errorMsg = error.error.message;
        } else if (error.status) {
          switch (error.status) {
            case 400:
              errorMsg = error.error?.message || 'Invalid data. Please check your inputs.';
              break;
            case 401:
              errorMsg = 'Unauthorized. Please log in again.';
              break;
            case 403:
              errorMsg = 'You do not have permission to perform this action.';
              break;
            case 404:
              errorMsg = 'Work experience not found.';
              break;
            case 500:
              errorMsg = 'Server error. Please try again later.';
              break;
            default:
              errorMsg = error.error?.message || 'An unexpected error occurred.';
          }
        }
        this.showErrorModal(errorMsg);
      }
    });
  }
  loadLanguageForm(index: number) {
    const languageCode = this.languages[index].code;
    this.setLanguageCode(languageCode);

    this.loadSkillsForLanguage(languageCode);

    const savedForm = this.savedForms.find(form => form.languageCode === languageCode);

    if (savedForm) {
      // Convert string dates to Date objects for the form if needed
      const startDate = savedForm.startDate ? savedForm.startDate.toString().substring(0, 10) : '';
      const endDate = savedForm.endDate ? savedForm.endDate.toString().substring(0, 10) : '';

      this.workExperienceForm.patchValue({
        userId: this.getUserIdFromStorage(),
        experienceId: this.experienceId,
        languageCode: savedForm.languageCode,
        jobTitle: savedForm.jobTitle,
        companyName: savedForm.companyName,
        location: savedForm.location,
        startDate: startDate,
        endDate: endDate,
        description: savedForm.description
      });

      this.skills = savedForm.skills || [];
    } else {
      this.workExperienceForm.reset({
        userId: this.getUserIdFromStorage(),
        experienceId: this.experienceId,
        languageCode: languageCode
      });
      this.skills = [];
    }

    if (this.selectedFiles[languageCode]) {
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

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

  isLastLanguage(): boolean {
    return this.currentLanguageIndex === this.languages.length - 1;
  }

  getCurrentLanguageName(): string {
    return this.languages[this.currentLanguageIndex].language;
  }

  getLanguageName(code: string): string {
    const language = this.languages.find(lang => lang.code === code);
    return language ? language.language : code;
  }

  setLanguageCode(code: string) {
    this.workExperienceForm.patchValue({ languageCode: code });
  }

  // ----------------------- error modal methods
  showErrorModal(message: string, isSuccess: boolean = false) {
    this.errorMessage = message;
    this.isErrorModalVisible = true;

    // Automatically hide success messages after 3 seconds
    if (isSuccess) {
      setTimeout(() => {
        this.isErrorModalVisible = false;
        this.errorMessage = null;
      }, 3000);
    }
  }

  closeErrorModal() {
    this.isErrorModalVisible = false;
    this.errorMessage = null;
  }

  // ----------------------- translation methods
  translateField(fieldName: string) {
    const nonTranslatableFields = ['companyName', 'startDate', 'endDate'];
    if (nonTranslatableFields.includes(fieldName)) return;

    if (this.currentLanguageIndex === this.primaryLanguageIndex) return;

    const originalText = this.originalPrimaryTexts.get(fieldName) as string;
    if (!originalText) return;

    const targetLanguage = this.languages[this.currentLanguageIndex].code;
    this.translating = true;

    this.http.get<{ translatedText: string }>(
      `http://localhost:8081/api/v1/ai/translate?text=${encodeURIComponent(originalText)}&targetLanguage=${targetLanguage}`
    ).subscribe({
      next: (response) => {
        this.workExperienceForm.patchValue({ [fieldName]: response.translatedText });
        this.translating = false;
      },
      error: (error) => {
        console.error('Translation error:', error);
        alert('Translation failed. Please try again.');
        this.translating = false;
      }
    });
  }

  translateSkills() {
    if (this.currentLanguageIndex === this.primaryLanguageIndex) return;

    const originalSkills = this.originalPrimaryTexts.get('skills') as string[];
    if (!originalSkills || originalSkills.length === 0) return;

    const targetLanguage = this.languages[this.currentLanguageIndex].code;
    this.translating = true;

    const skillsText = originalSkills.join('|||');

    this.http.get<{ translatedText: string }>(
      `http://localhost:8081/api/v1/ai/translate?text=${encodeURIComponent(skillsText)}&targetLanguage=${targetLanguage}`
    ).subscribe({
      next: (response) => {
        const translatedSkills = response.translatedText.split('|||');
        this.skills = translatedSkills.map(skill => skill.trim()).filter(skill => skill !== '');
        this.saveSkillsForCurrentLanguage();
        this.translating = false;
      },
      error: (error) => {
        console.error('Skills translation error:', error);
        alert('Skills translation failed. Please try again.');
        this.translating = false;
      }
    });
  }

  translateAllFields() {
    if (this.currentLanguageIndex === this.primaryLanguageIndex) return;

    this.translateField('jobTitle');
    this.translateField('location');
    this.translateField('description');
    this.translateSkills();
  }

  cancelUpdate() {
    this.router.navigate(['/portfolio/work-experiences']);
  }
}
