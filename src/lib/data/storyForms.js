export const STORY_FORMS = [
	{ id: 'video', label: 'Video', icon: '🎬', duration: 45 },
	{ id: 'audio', label: 'Audio', icon: '🎙️', duration: 35 },
	{ id: 'text', label: 'Text', icon: '✍️', duration: 30 },
	{ id: 'data', label: 'Data', icon: '📊', duration: 40 },
	{ id: 'social', label: 'Social', icon: '📱', duration: 25 },
	{ id: 'free', label: 'Free', icon: '🎯', duration: 30 }
];

export const PICK_OR_SPIN = { id: 'pick-or-spin', label: 'Pick or Spin', icon: '🔄', duration: null };

export function getDuration(formId) {
	const form = STORY_FORMS.find(f => f.id === formId);
	return form ? form.duration : 30;
}
