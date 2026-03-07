export const STORY_FORMS = [
	{ id: 'video', label: 'Video', icon: '/logos/icon-video.svg', duration: 60 },
	{ id: 'audio', label: 'Audio', icon: '/logos/icon-audio.svg', duration: 45 },
	{ id: 'text', label: 'Text', icon: '/logos/icon-text.svg', duration: 30 },
	{ id: 'data', label: 'Data', icon: '/logos/icon-data.svg', duration: 30 },
	{ id: 'social', label: 'Social', icon: '/logos/icon-social.svg', duration: 30 },
	{ id: 'free', label: 'FREE GO', icon: '/logos/icon-free-go.svg', duration: 30 }
];

export const PICK_OR_SPIN = { id: 'pick-or-spin', label: 'Pick or Spin', icon: '🔄', duration: null };

export function getDuration(formId) {
	const form = STORY_FORMS.find(f => f.id === formId);
	return form ? form.duration : 30;
}
