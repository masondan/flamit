/**
 * FlamNav Web Component
 * Shared hamburger menu for all FlamTools apps.
 * Usage: <flam-nav current="promptflam"></flam-nav>
 */
class FlamNav extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._open = false;
		this._onKeyDown = null;
		// Portal elements appended to document.body to escape overflow:hidden ancestors
		this._portalOverlay = null;
		this._portalDrawer = null;
	}

	static get observedAttributes() {
		return ['current'];
	}

	get current() {
		return this.getAttribute('current') || '';
	}

	connectedCallback() {
		this.render();
		this._onKeyDown = (e) => { if (e.key === 'Escape') this.close(); };
	}

	disconnectedCallback() {
		document.removeEventListener('keydown', this._onKeyDown);
		this._removePortal();
	}

	_removePortal() {
		if (this._portalOverlay) { this._portalOverlay.remove(); this._portalOverlay = null; }
		if (this._portalDrawer) { this._portalDrawer.remove(); this._portalDrawer = null; }
	}

	toggle() {
		this._open ? this.close() : this.open();
	}

	_getAppContainer() {
		let el = this.closest('.app-container, .app, .page, [class*="max-w"]');
		if (!el) el = this.closest('[style*="max-width"]');
		return el;
	}

	open() {
		this._open = true;

		// Get app container bounds to constrain drawer/overlay to app area
		const container = this._getAppContainer();
		const rect = container ? container.getBoundingClientRect() : null;

		// Create portal overlay
		if (!this._portalOverlay) {
			this._portalOverlay = document.createElement('div');
			this._portalOverlay.style.cssText = `
				position: fixed;
				background: rgba(0,0,0,0.3);
				z-index: 9998;
				opacity: 0;
				visibility: hidden;
				transition: opacity 250ms ease, visibility 250ms ease;
			`;
			this._portalOverlay.addEventListener('click', () => this.close());
			document.body.appendChild(this._portalOverlay);
		}

		// Position overlay over app container only
		if (rect) {
			this._portalOverlay.style.left = rect.left + 'px';
			this._portalOverlay.style.top = rect.top + 'px';
			this._portalOverlay.style.width = rect.width + 'px';
			this._portalOverlay.style.bottom = (window.innerHeight - rect.bottom) + 'px';
		} else {
			this._portalOverlay.style.inset = '0';
		}

		// Create portal drawer
		if (!this._portalDrawer) {
			const apps = [
				{ id: 'promptflam', name: 'PromptFlam', url: 'https://promptflam.flamtools.com' },
				{ id: 'picflam', name: 'PicFlam', url: 'https://picflam.flamtools.com' },
				{ id: 'audioflam', name: 'AudioFlam', url: 'https://audioflam.flamtools.com' },
				{ id: 'chartflam', name: 'ChartFlam', url: 'https://chartflam.flamtools.com' },
				{ id: 'mapflam', name: 'MapFlam', url: 'https://mapflam.flamtools.com' },
				{ id: 'subflam', name: 'SubFlam', url: 'https://subflam.flamtools.com' },
				{ id: 'storyflam', name: 'StoryFlam', url: 'https://storyflam.flamtools.com', training: true },
				{ id: 'flamit', name: 'FlamIt', url: 'https://flamit.flamtools.com', training: true }
			];
			const current = this.current;

			this._portalDrawer = document.createElement('div');
			this._portalDrawer.style.cssText = `
				position: fixed;
				width: 180px;
				background: #fff;
				z-index: 9999;
				opacity: 0;
				visibility: hidden;
				transition: opacity 250ms ease, visibility 250ms ease;
				display: flex;
				flex-direction: column;
				box-shadow: 2px 0 12px rgba(0,0,0,0.15);
				font-family: 'Saira', -apple-system, BlinkMacSystemFont, sans-serif;
			`;

			const listItems = apps.map((app, i) => {
				const isCurrent = app.id === current;
				const color = isCurrent ? '#5422b0' : (app.training ? '#777' : '#333');
				const bg = isCurrent ? '#f0e6f7' : 'transparent';
				const weight = isCurrent ? '750' : '550';
				const separator = i === 6 ? `<div style="height:1px;background:#eee;margin:6px 16px;"></div>` : '';
				return `${separator}<a href="${app.url}" style="display:block;padding:10px 16px;text-decoration:none;font-size:15px;font-weight:${weight};color:${color};background:${bg};">${app.name}</a>`;
			}).join('');

			this._portalDrawer.innerHTML = `
				<div style="padding:20px 16px 12px;border-bottom:1px solid #eee;">
					<a href="https://flamtools.com" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:#5422b0;font-size:15px;font-weight:750;">
						<img src="https://flamtools.com/logos/logo-flamtools-favicon.svg" style="width:20px;height:20px;" alt="" />
						FlamTools
					</a>
				</div>
				<div style="flex:1;overflow-y:auto;">${listItems}</div>
			`;
			document.body.appendChild(this._portalDrawer);
		}

		// Position drawer: left edge of app container, full app height
		if (rect) {
			this._portalDrawer.style.left = rect.left + 'px';
			this._portalDrawer.style.top = rect.top + 'px';
			this._portalDrawer.style.bottom = (window.innerHeight - rect.bottom) + 'px';
		} else {
			this._portalDrawer.style.left = '0';
			this._portalDrawer.style.top = '0';
			this._portalDrawer.style.bottom = '0';
		}

		// Animate in
		requestAnimationFrame(() => {
			this._portalOverlay.style.opacity = '1';
			this._portalOverlay.style.visibility = 'visible';
			this._portalDrawer.style.opacity = '1';
			this._portalDrawer.style.visibility = 'visible';
		});

		document.addEventListener('keydown', this._onKeyDown);
	}

	close() {
		this._open = false;
		if (this._portalOverlay) {
			this._portalOverlay.style.opacity = '0';
			this._portalOverlay.style.visibility = 'hidden';
		}
		if (this._portalDrawer) {
			this._portalDrawer.style.opacity = '0';
			this._portalDrawer.style.visibility = 'hidden';
		}
		document.removeEventListener('keydown', this._onKeyDown);
	}

	render() {
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: flex;
					align-items: center;
				}
				.menu-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					border: none;
					background: transparent;
					cursor: pointer;
					padding: 0;
					color: inherit;
					transition: color 150ms ease;
				}
				.menu-btn svg {
					width: 22px;
					height: 22px;
				}
			</style>
			<button class="menu-btn" aria-label="Open navigation menu" type="button">
				<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
					<path d="M7.95 11.95H39.95"/>
					<path d="M7.95 23.95H39.95"/>
					<path d="M7.95 35.95H39.95"/>
				</svg>
			</button>
		`;
		this.shadowRoot.querySelector('.menu-btn').addEventListener('click', () => this.toggle());
	}
}

customElements.define('flam-nav', FlamNav);
