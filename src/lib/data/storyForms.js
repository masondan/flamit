export const STORY_FORMS = [
	{ id: 'video', label: 'Video', icon: '/icons/icon-video.svg', duration: 60 },
	{ id: 'audio', label: 'Audio', icon: '/icons/icon-audio.svg', duration: 45 },
	{ id: 'text', label: 'Text', icon: '/icons/icon-text.svg', duration: 30 },
	{ id: 'data', label: 'Data', icon: '/icons/icon-data.svg', duration: 30 },
	{ id: 'social', label: 'Social', icon: '/icons/icon-social.svg', duration: 30 },
	{ id: 'free', label: 'Free', icon: '/icons/icon-free-go.svg', duration: 30 }
];

/** Format reel items with equal distribution */
export const FORMAT_REEL = [
	{ id: 'video', label: 'Video', icon: '/icons/icon-video.svg', duration: 60 },
	{ id: 'audio', label: 'Audio', icon: '/icons/icon-audio.svg', duration: 45 },
	{ id: 'text', label: 'Text', icon: '/icons/icon-text.svg', duration: 30 },
	{ id: 'free', label: 'Free', icon: '/icons/icon-free-go.svg', duration: 30 },
	{ id: 'data', label: 'Data', icon: '/icons/icon-data.svg', duration: 30 },
	{ id: 'social', label: 'Social', icon: '/icons/icon-social.svg', duration: 30 }
];

export function getDuration(formId) {
	const form = STORY_FORMS.find(f => f.id === formId);
	return form ? form.duration : 30;
}
