import { mockTutorService } from './mockTutorService.js';

// Replace this adapter with an authenticated server endpoint when deploying AI.
export const tutorService = mockTutorService;

// Example for later, once the backend stores uploaded materials:
export const apiTutorService = {
  async generate({ material, mode, attempts = [] }) {
    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId: material.materialId, mode, attempts }),
    });
    if (!response.ok) throw new Error('Tutor 응답을 받지 못했어요.');
    return response.json();
  },
};
