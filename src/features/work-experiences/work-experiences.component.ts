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
export class WorkExperienceComponent  {
  // Properties for form handling

}
