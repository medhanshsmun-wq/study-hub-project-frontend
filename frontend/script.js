document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const authContainer = document.getElementById('auth-container');
    const modeSelector = document.getElementById('mode-selector');
    const loginModalOverlay = document.getElementById('login-modal-overlay');

    let fullData = {};
    let currentUser = null;
    let progressData = {};
    
    const themes = {
        light: { name: 'Default Light', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#FFD700" stroke="#FFA500" stroke-width="1.5"></circle><line x1="12" y1="1" x2="12" y2="3" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="12" y1="21" x2="12" y2="23" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="1" y1="12" x2="3" y2="12" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="21" y1="12" x2="23" y2="12" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#FFA500" stroke-width="2" stroke-linecap="round"></line></svg>' },
        midnight: { name: 'Midnight Blue', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12.17,2.06A10,10,0,0,0,2,12a10,10,0,0,0,10.17,9.94,10,10,0,0,0,0-19.88Z" fill="#4299e1" stroke="#2b6cb0" stroke-width="1.5"/><path d="M16 5.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5z" fill="white"/><path d="M18 9.5a.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5z" fill="white"/></svg>' },
        twilight: { name: 'Lo-fi Twilight', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#d6bcfa" stroke="#9f7aea" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></polygon></svg>' },
        forest: { name: 'Forest Night', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M14.5 9A7 7 0 0 0 3 12v8h18v-8a7 7 0 0 0-6.5-3z" fill="#2f855a" stroke="#276749" stroke-width="1.5"></path><path d="M14.5 9a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3z" fill="#9ae6b4"></path></svg>' },
        graphite: { name: 'Graphite', icon: '<svg width="20" height="20" viewBox="0 0 24 24"><path d="m18 5-3-3-6 6 3 3Z" fill="#718096" stroke="#4a5568" stroke-width="1.5"></path><path d="m6 8 3 3" fill="#a0aec0"></path><path d="m22 12-3-3-10 10 3 3 10-10Z" fill="#a0aec0" stroke="#4a5568" stroke-width="1.5"></path></svg>' },
        onyx: { name: 'Onyx Dark', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bb86fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>' }
    };
    const customThemeKey = 'custom';

    function injectAnimationStyles() {
    }

    function buildThemeSelector() {
        const themeSelector = document.createElement('div');
        themeSelector.id = 'theme-selector';
        
        Object.entries(themes).forEach(([key, theme]) => {
            const button = document.createElement('button');
            button.className = 'theme-btn';
            button.dataset.theme = key;
            button.title = theme.name;
            button.innerHTML = theme.icon;
            button.addEventListener('click', () => applyTheme(key));
            themeSelector.appendChild(button);
        });

        // Add custom theme button
        const customButton = document.createElement('button');
        customButton.className = 'theme-btn';
        customButton.dataset.theme = customThemeKey;
        customButton.title = 'Create Custom Theme';
        customButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"></path><path d="M12 22V12"></path></svg>';
        customButton.addEventListener('click', () => showCustomThemeEditor());
        themeSelector.appendChild(customButton);

        document.getElementById('theme-selector-container').appendChild(themeSelector);
    }

    function applyTheme(themeKey) {
        document.body.dataset.theme = themeKey;
        localStorage.setItem('studyHubTheme', themeKey);

        // Handle custom theme application
        const customStyleEl = document.getElementById('custom-theme-styles');
        if (themeKey === customThemeKey) {
            applyCustomThemeStyles();
        } else if (customStyleEl) {
            customStyleEl.remove();
        }

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeKey);
        });
    }

    buildThemeSelector();
    const savedTheme = localStorage.getItem('studyHubTheme') || 'light';
    // Apply theme, but if it's a custom theme that doesn't exist yet, default to light
    if (savedTheme === customThemeKey && !localStorage.getItem('customThemeColors')) {
        applyTheme('light');
    } else {
        applyTheme(savedTheme);
    }

    // --- Global Event Listeners ---
    // Attach listener for the Athena FAB as soon as the DOM is ready.
    // Use openAthena() wrapper which provides error handling and simple feedback.
    function openAthena() {
        try {
            // Small visual feedback so user knows the click registered
            const fab = document.getElementById('athena-fab-btn');
            if (fab) {
                fab.classList.add('pressed');
                setTimeout(() => fab.classList.remove('pressed'), 220);
            }

            // Ensure the main containers exist. If they're missing (some setups remove them), create fallbacks.
            let mainViewWrapper = document.getElementById('main-view-wrapper');
            let specialViewWrapper = document.getElementById('special-view-wrapper');
            if (!mainViewWrapper || !specialViewWrapper) {
                console.warn('Required view wrappers not found in DOM. Creating fallback wrappers.', { mainViewWrapper, specialViewWrapper });
                if (!contentContainer) {
                    console.error('contentContainer is also missing; cannot create wrappers.');
                    alert('UI error: Could not open Athena. Please refresh the page.');
                    return;
                }

                if (!mainViewWrapper) {
                    mainViewWrapper = document.createElement('div');
                    mainViewWrapper.id = 'main-view-wrapper';
                    // Move any existing children into mainViewWrapper if contentContainer is not empty
                    while (contentContainer.firstChild) {
                        mainViewWrapper.appendChild(contentContainer.firstChild);
                    }
                    contentContainer.appendChild(mainViewWrapper);
                }

                if (!specialViewWrapper) {
                    specialViewWrapper = document.createElement('div');
                    specialViewWrapper.id = 'special-view-wrapper';
                    specialViewWrapper.style.display = 'none';
                    contentContainer.appendChild(specialViewWrapper);
                }
            }

            buildSpecialView('athena', buildAthenaView);
        } catch (err) {
            console.error('Failed to open Athena:', err);
            alert('Could not open Athena chat. See console for details.');
        }
    }

    const athenaFab = document.getElementById('athena-fab-btn');
    athenaFab?.addEventListener('click', openAthena);

    // Also make the header "Athena AI" feature (small neural icon in the tagline) clickable.
    // Some users click the header label expecting the chat to open; handle that here.
    const headerAthenaFeature = document.querySelector('.feature-icon[title="Athena AI"]');
    headerAthenaFeature?.setAttribute('role', 'button');
    headerAthenaFeature?.setAttribute('tabindex', '0');
    headerAthenaFeature?.addEventListener('click', openAthena);
    headerAthenaFeature?.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') openAthena(); });


    // Fetch data from the backend API
    // And check for current user
    // Use the Vercel environment variable for the backend URL
    const API_BASE_URL =
        window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://study-hub-project-backend.onrender.com';
       

    fetch(`${API_BASE_URL}/api/data`, { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            fullData = data;
            // Fetch user status after fetching data

            // TEMPORARY: Inject dummy sem-2 data for demonstration purposes.
            // REMOVE THIS BLOCK ONCE YOUR BACKEND PROVIDES ACTUAL SEMESTER 2 DATA.
            if (!fullData['sem-2']) {
                fullData['sem-2'] = {
                    "Dummy Subject 201": {
                        "Unit 1: Introduction": {
                            "notes": [
                                { "title": "Welcome to Sem 2", "points": ["This is a placeholder for Semester 2 content."] }
                            ]
                        }
                    }
                };
            }
            // END TEMPORARY INJECTION
            return fetch(`${API_BASE_URL}/api/current_user`, { credentials: 'include' });
        })
        .then(response => response.json())
        .then(user => {
            currentUser = user;
            loadProgress();
            renderHeader(); // Render header first to place special buttons
            buildAppUI(fullData); // Build the new main UI
            buildQuickAccessMenu(); // Add the floating action button
            
            // Show login modal if not logged in
            if (!currentUser) loginModalOverlay.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
            contentContainer.innerHTML = `<p class="error">Failed to load study materials. Please ensure the backend server is running and check the console for errors.</p>`;
        });

    function buildQuickAccessMenu() {
        const fabContainer = document.createElement('div');
        fabContainer.id = 'fab-container';
        fabContainer.innerHTML = `
            <div class="fab-menu">
                <button class="fab-action-btn" data-action="add-note" title="Add Note">📝</button>
                <button class="fab-action-btn" data-action="start-quiz" title="Start Random Quiz">🎲</button>
                <button class="fab-action-btn" data-action="gen-flashcards" title="Generate Flashcards">✨</button>
            </div>
            <button id="fab-main-btn" class="fab-main-btn">+</button>
        `;
        document.body.appendChild(fabContainer);
    
        const mainBtn = document.getElementById('fab-main-btn');
        mainBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fabContainer.classList.toggle('open');
        });
    
        // Add event listeners for actions
        fabContainer.querySelector('[data-action="add-note"]').addEventListener('click', () => {
            alert('"Add Note" feature coming soon!');
            fabContainer.classList.remove('open');
        });
    
        fabContainer.querySelector('[data-action="start-quiz"]').addEventListener('click', () => {
            startRandomQuiz();
            fabContainer.classList.remove('open');
        });
    
        fabContainer.querySelector('[data-action="gen-flashcards"]').addEventListener('click', () => {
            alert('"Generate Flashcards" feature coming soon!');
            fabContainer.classList.remove('open');
        });

        // Close menu if clicking outside
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target) && fabContainer.classList.contains('open')) {
                fabContainer.classList.remove('open');
            }
        });
    }

    function startRandomQuiz() {

        const allQuestionBanks = Object.values(fullData).flatMap(sem => Object.values(sem).flatMap(subj => subj.questionBank || []));
        if (allQuestionBanks.length === 0) {
            alert('No objective questions available to start a random quiz.');
            // Restore UI if no questions found
            modeSelector.style.display = 'flex';
            buildAppUI(fullData);
            return;
        }
        // Pass a flag to startTest to indicate it's a random quiz
        startTest(allQuestionBanks, Math.min(10, allQuestionBanks.length), 'practice', true);
    }

    function loadProgress() {
        try {
            const savedProgress = localStorage.getItem('studyHubProgress');
            if (savedProgress) {
                progressData = JSON.parse(savedProgress);
            } else {
                progressData = {};
            }
        } catch (e) {
            console.error("Failed to load progress:", e);
            progressData = {};
        }
    }

    function saveProgress() {
        try {
            localStorage.setItem('studyHubProgress', JSON.stringify(progressData));
        } catch (e) {
            console.error("Failed to save progress:", e);
        }
    }

    function toggleTopicCompletion(semKey, subjectKey, topicKey) {
        progressData[semKey] = progressData[semKey] || {};
        progressData[semKey][subjectKey] = progressData[semKey][subjectKey] || {};
        progressData[semKey][subjectKey][topicKey] = !progressData[semKey][subjectKey][topicKey];
        saveProgress();
    }

    function renderHeader() {
        if (currentUser && authContainer) {
            const profilePictureUrl = currentUser.photo; // Assuming this is passed from the backend
            const profileButtonContent = profilePictureUrl
                ? `<img src="${profilePictureUrl}" alt="Profile" class="profile-picture">`
                : `<span class="profile-initial">${currentUser.displayName ? currentUser.displayName.charAt(0) : '?'}</span>`;

            authContainer.innerHTML = `
                <span class="display-name">Welcome, ${currentUser.displayName}</span>
                <button id="profile-btn" class="header-action-btn profile-btn">${profileButtonContent}</button>
                <a href="${API_BASE_URL}/api/logout" class="header-action-btn">Logout</a>
            `;
            authContainer.style.display = 'flex';
        }
        // Always re-attach event listener to ensure it works after re-renders.
        document.getElementById('profile-btn')?.addEventListener('click', () => buildSpecialView('profile', buildProfileView));
    }

    function buildAppUI(data) {
        modeSelector.innerHTML = ''; // This will now hold semester tabs
        const mainViewWrapper = document.getElementById('main-view-wrapper');
        if (!mainViewWrapper) {
            console.error("Critical error: #main-view-wrapper not found. UI cannot be built.");
            return;
        }
        mainViewWrapper.innerHTML = ''; // Clear only the main view content

        const semesters = Object.keys(data).filter(key => key.startsWith('sem-')).sort((a, b) => {
            const numA = parseInt(a.split('-')[1]);
            const numB = parseInt(b.split('-')[1]);
            return numA - numB;
        });

        // Create Semester Tabs
        semesters.forEach(semKey => {
            const semNum = semKey.split('-')[1];
            const tab = document.createElement('button');
            tab.className = 'semester-tab-main';
            tab.textContent = `Semester ${semNum}`;
            tab.dataset.target = `sem-pane-${semNum}`;
            modeSelector.appendChild(tab);
        });

        // Create Semester Content Panes
        semesters.forEach(semKey => {
            const semNum = semKey.split('-')[1];
            const semPane = document.createElement('div');
            semPane.id = `sem-pane-${semNum}`;
            semPane.className = 'semester-pane-main'; // This will be a child of main-view-wrapper
            mainViewWrapper.appendChild(semPane);

            // Inside each semester pane, create the mode tabs (Notes, Flashcards, etc.)
            buildSubjectTabsForSemester(semPane, semKey, data[semKey]);
        });

        // Activate the last viewed or first semester
        const lastSem = localStorage.getItem('activeSemester') || (semesters.length > 0 ? semesters[0] : null);
        const semNumToActivate = lastSem.split('-')[1];
        document.querySelector(`.semester-tab-main[data-target="sem-pane-${semNumToActivate}"]`)?.classList.add('active');
        document.getElementById(`sem-pane-${semNumToActivate}`)?.classList.add('active');

        // Add event listener for main semester tabs
        modeSelector.addEventListener('click', e => {
            if (e.target.matches('.semester-tab-main')) {
                document.querySelectorAll('.semester-tab-main').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.semester-pane-main').forEach(pane => pane.classList.remove('active'));

                e.target.classList.add('active');
                const targetPaneId = e.target.dataset.target;
                document.getElementById(targetPaneId).classList.add('active');
                localStorage.setItem('activeSemester', `sem-${targetPaneId.split('-')[2]}`);
            }
        });
    }

    function buildSubjectTabsForSemester(semesterPane, semKey, semesterData) {
        const subjectTabsContainer = document.createElement('div');
        subjectTabsContainer.className = 'subject-tabs-main'; // New class for main subject tabs
        const subjectContentsContainer = document.createElement('div');
        subjectContentsContainer.className = 'subject-contents-main';

        const subjects = Object.keys(semesterData).filter(key => typeof semesterData[key] === 'object' && semesterData[key] !== null && !Array.isArray(semesterData[key]));

        subjects.forEach(subjectKey => {
            // Create Subject Tab
            const tab = document.createElement('button');
            tab.className = 'subject-tab-secondary'; // New class for styling
            tab.textContent = subjectKey;
            tab.dataset.target = `${semKey}-${subjectKey.replace(/\s+/g, '-')}`;
            subjectTabsContainer.appendChild(tab);

            // Create Subject Content Pane
            const subjectPane = document.createElement('div');
            subjectPane.id = tab.dataset.target;
            subjectPane.className = 'subject-pane-main';
            renderContentForSubject(subjectPane, semKey, subjectKey, semesterData[subjectKey]);
            subjectContentsContainer.appendChild(subjectPane);
        });

        semesterPane.appendChild(subjectTabsContainer);
        semesterPane.appendChild(subjectContentsContainer);

        // Activate last viewed or first subject
        const lastSubject = localStorage.getItem(`activeSubject_${semKey}`) || (subjects.length > 0 ? subjects[0] : null);
        if (lastSubject) {
            const targetId = `${semKey}-${lastSubject.replace(/\s+/g, '-')}`;
            document.querySelector(`.subject-tab-secondary[data-target="${targetId}"]`)?.classList.add('active');
            document.getElementById(targetId)?.classList.add('active');
        }

        // Add event listener for subject tabs within this semester
        subjectTabsContainer.addEventListener('click', e => {
            if (e.target.matches('.subject-tab-secondary')) {
                subjectTabsContainer.querySelectorAll('.subject-tab-secondary').forEach(btn => btn.classList.remove('active'));
                subjectContentsContainer.querySelectorAll('.subject-pane-main').forEach(pane => pane.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(e.target.dataset.target).classList.add('active');
                const subjectKey = e.target.textContent;
                localStorage.setItem(`activeSubject_${semKey}`, subjectKey);
            }
        });
    }

    function renderContentForSubject(subjectPane, semKey, subjectKey, subjectData) {
        subjectPane.innerHTML = `
            <div class="subject-content-wrapper">
                <div class="content-type-sidebar">
                    <button class="sidebar-toggle-btn" title="Collapse Sidebar">«</button>
                </div>
                <div class="content-type-main-area"></div>
            </div>
        `;

        const wrapper = subjectPane.querySelector('.subject-content-wrapper');
        const toggleBtn = subjectPane.querySelector('.sidebar-toggle-btn');

        // Check and apply saved sidebar state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            wrapper.classList.add('sidebar-collapsed');
            toggleBtn.textContent = '»';
            toggleBtn.title = 'Expand Sidebar';
        }

        toggleBtn.addEventListener('click', () => {
            const isCollapsed = wrapper.classList.toggle('sidebar-collapsed');
            toggleBtn.textContent = isCollapsed ? '»' : '«';
            toggleBtn.title = isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar';
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });

        const sidebar = subjectPane.querySelector('.content-type-sidebar');
        const mainArea = subjectPane.querySelector('.content-type-main-area');

        const modes = [
            { id: 'notes', text: 'Notes 📚', builder: renderNotesForSubject },
            { id: 'flashcards', text: 'Flashcards 📇', builder: renderFlashcardsForSubject },
            { id: 'question-bank', text: 'Objective Qs 🎯', builder: renderQuestionBankForSubject },
            { id: 'subjective', text: 'Subjective Qs ✍️', builder: renderSubjectiveForSubject },
        ];

        modes.forEach(mode => {
            const button = document.createElement('button');
            button.className = 'content-type-btn';
            button.innerHTML = `<span class="btn-icon">${mode.text.split(' ')[1]}</span><span class="btn-text">${mode.text.split(' ')[0]}</span>`;
            button.title = mode.text.split(' ')[0]; // Set tooltip for collapsed view
            button.dataset.modeId = mode.id;
            sidebar.appendChild(button);

            button.addEventListener('click', () => {
                // Set active class on sidebar button
                sidebar.querySelectorAll('.content-type-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                mainArea.innerHTML = '';
                mode.builder(mainArea, subjectData, semKey, subjectKey);
            });
        });

        // Automatically click the first button (Notes) to load it by default
        const firstButton = sidebar.querySelector('.content-type-btn');
        if (firstButton) {
            firstButton.click();
        }
    }

    function enterSpecialView() {
        const mainViewWrapper = document.getElementById('main-view-wrapper');
        const specialViewWrapper = document.getElementById('special-view-wrapper');

        if (modeSelector) modeSelector.style.display = 'none';
        if (mainViewWrapper) mainViewWrapper.style.display = 'none';
        if (specialViewWrapper) {
            specialViewWrapper.style.display = 'block';
            specialViewWrapper.innerHTML = ''; // Clear previous special view
        }

        document.body.classList.add('special-view-active');
        document.querySelector('.app-body').classList.add('full-height-view');

        // Return the container that the special view should render into
        return specialViewWrapper;
    }

    function returnToStudyHub() {
        const mainViewWrapper = document.getElementById('main-view-wrapper');
        const specialViewWrapper = document.getElementById('special-view-wrapper');

        // Hide special views and show main ones
        if (specialViewWrapper) specialViewWrapper.style.display = 'none';
        if (mainViewWrapper) mainViewWrapper.style.display = 'block';
        if (modeSelector) modeSelector.style.display = 'flex';

        // Clean up body classes
        document.body.classList.remove('special-view-active');
        document.querySelector('.app-body').classList.remove('full-height-view');

        buildAppUI(fullData); // Rebuild the main UI
    }
    function buildSpecialView(mode, builderFunction) {
        const specialViewWrapper = enterSpecialView();
        builderFunction(specialViewWrapper); // Pass the correct container
        
        // Add a back button
        const backButton = document.createElement('button');
        backButton.textContent = '← Back to Study Hub';
        backButton.className = 'back-button';
        backButton.onclick = returnToStudyHub;
        const firstChild = specialViewWrapper.firstChild;
        if (firstChild) {
            specialViewWrapper.insertBefore(backButton, firstChild);
        }
    }

    function renderNotesForSubject(container, subjectData, semKey, subjectKey) {
        const topics = Object.keys(subjectData).filter(key => subjectData[key] && subjectData[key].notes);
    
        if (topics.length === 0) {
            container.innerHTML = '<p>No notes available for this subject yet.</p>';
            return;
        }
    
        const topicTabsContainer = document.createElement('div');
        topicTabsContainer.className = 'topic-tabs';
        const topicContentsContainer = document.createElement('div');
        topicContentsContainer.className = 'topic-contents';
    
        topics.forEach((topicKey, topicIndex) => {
            const topic = subjectData[topicKey];
            const topicId = `${semKey}-${subjectKey.replace(/\s+/g, '-')}-notes-${topicKey.replace(/\s+/g, '-')}`;
    
            // Create Topic Tab Button
            const topicTab = document.createElement('button');
            topicTab.className = 'topic-tab';
            topicTab.textContent = topicKey;
            topicTab.dataset.target = topicId;
            topicTabsContainer.appendChild(topicTab);
    
            // Create Topic Content Pane
            const topicContent = document.createElement('div');
            topicContent.className = 'topic-pane';
            topicContent.id = topicId;
    
            if (subjectKey === "Engineering Chemistry (AC 101)" || subjectKey === "Applied Mathematics - I (AM 101)" || subjectKey === "Basic Electrical Engineering (BEE 101)") {
                // Special tabbed layout for Chemistry sub-headings
                const subTopicTabsContainer = document.createElement('div');
                subTopicTabsContainer.className = 'sub-topic-tabs';
                const subTopicContentsContainer = document.createElement('div');
                subTopicContentsContainer.className = 'sub-topic-contents';
    
                topic.notes.forEach((note, subTopicIndex) => {
                    const subTopicId = `${topicId}-${subTopicIndex}`;
    
                    const subTopicTab = document.createElement('button');
                    subTopicTab.className = 'sub-topic-tab';
                    subTopicTab.innerHTML = note.title;
                    subTopicTab.dataset.target = subTopicId;
                    subTopicTabsContainer.appendChild(subTopicTab);
    
                    const subTopicContent = document.createElement('div');
                    subTopicContent.className = 'sub-topic-pane';
                    subTopicContent.id = subTopicId;
    
                    const pointsList = document.createElement('ul');
                    note.points.forEach(point => {
                        // Use a proper <li> for semantic lists
                        const pointItem = document.createElement('li');
                        pointItem.className = 'key-point-card';
                        pointItem.innerHTML = point; // The point can contain HTML like <strong>
                        pointsList.appendChild(pointItem);
                    });
                    subTopicContent.appendChild(pointsList);
                    subTopicContentsContainer.appendChild(subTopicContent);
    
                    if (subTopicIndex === 0) {
                        subTopicTab.classList.add('active');
                        subTopicContent.classList.add('active');
                    }
                });
    
                topicContent.appendChild(subTopicTabsContainer);
                topicContent.appendChild(subTopicContentsContainer);
            } else {
                // Original layout for other subjects
                topic.notes.forEach(note => {
                    const noteTitle = document.createElement('h5');
                    noteTitle.innerHTML = note.title;
                    topicContent.appendChild(noteTitle);
    
                    const pointsList = document.createElement('ul');
                    note.points.forEach(point => {
                        // Use a proper <li> for semantic lists
                        const pointItem = document.createElement('li');
                        pointItem.className = 'key-point-card';
                        pointItem.innerHTML = point; // The point can contain HTML like <strong>
                        pointsList.appendChild(pointItem);
                    });
                    topicContent.appendChild(pointsList);
                });
            }
    
            topicContentsContainer.appendChild(topicContent);
    
            if (topicIndex === 0) {
                topicTab.classList.add('active');
                topicContent.classList.add('active');
            }
        });
    
        container.appendChild(topicTabsContainer);
        container.appendChild(topicContentsContainer);
    
        // Add event listener for topic and sub-topic tabs
        container.addEventListener('click', (e) => {
            if (e.target.matches('.topic-tab')) {
                container.querySelectorAll('.topic-tab').forEach(btn => btn.classList.remove('active'));
                container.querySelectorAll('.topic-pane').forEach(pane => pane.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.target).classList.add('active');
            }
    
            if (e.target.matches('.sub-topic-tab')) {
                const parentPane = e.target.closest('.topic-pane');
                parentPane.querySelectorAll('.sub-topic-tab').forEach(btn => btn.classList.remove('active'));
                parentPane.querySelectorAll('.sub-topic-pane').forEach(pane => pane.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.target).classList.add('active');
            }
        });
    }

    function renderFlashcardsForSubject(container, subjectData, semKey, subjectKey) {
        // Correctly gather all flashcards from all topics within the subject
        const allFlashcards = Object.values(subjectData)
            .filter(topic => topic && Array.isArray(topic.flashcards))
            .flatMap(topic => topic.flashcards);

        if (allFlashcards.length > 0) {
            const flashcardGrid = document.createElement('div');
            flashcardGrid.className = 'flashcard-grid';
            allFlashcards.forEach(card => {
                const flashcard = document.createElement('div');
                flashcard.className = 'flashcard';
                flashcard.innerHTML = `
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <p>${card.question}</p>
                        </div>
                        <div class="flashcard-back">
                            <p>${card.answer}</p>
                        </div>
                    </div>
                `;
                flashcard.addEventListener('click', () => {
                    flashcard.classList.toggle('is-flipped');
                });
                flashcardGrid.appendChild(flashcard);
            });
            container.appendChild(flashcardGrid);
            animateInElements(flashcardGrid.querySelectorAll('.flashcard'));
        } else {
            container.innerHTML = '<p>No flashcards available for this subject yet.</p>';
        }
    }

    function renderQuestionBankForSubject(container, subjectData, semKey, subjectKey) {
        const subjectId = `${semKey}-${subjectKey.replace(/\s+/g, '-')}-qb`;

        // --- FIX START: Consolidate questions from all sources ---
        // 1. Get questions from the top-level 'questionBank' array for the subject.
        const topLevelQs = subjectData.questionBank || [];
        // 2. Get questions from 'quiz' arrays inside each unit/topic.
        const unitLevelQs = Object.values(subjectData).flatMap(topic => topic.quiz || []);
        // 3. Combine them into a single list.
        const subjectQuestionBank = [...topLevelQs, ...unitLevelQs];
        // --- FIX END ---

        if (subjectQuestionBank.length > 0) {
            // Build the list of all questions
            let allQuestionsHtml = '<div class="all-questions-list">';
            subjectQuestionBank.forEach((q, i) => {
                allQuestionsHtml += `
                    <div class="all-questions-item">
                        <p><strong>Q${i + 1}:</strong> ${q.question}</p>
                        <span><strong>Answer:</strong> ${q.options[q.correct]}</span>
                    </div>
                `;
            });
            allQuestionsHtml += '</div>';

            // Build the quiz setup UI
            const quizSetupHtml = `
                <div class="qb-setup-container">
                    <h3>Take a Quiz</h3>
                    <p class="setup-description">Customize your test and challenge yourself!</p>
                    <div class="qb-setup-options">
                        <div class="setup-option-card">
                            <h4><span class="card-icon">🔢</span> Number of Questions</h4>
                            <p>Select how many questions you want in your quiz.</p>
                            <div class="question-count-selector">
                                <input type="range" id="num-questions-slider-single" min="1" max="${subjectQuestionBank.length}" value="${Math.min(10, subjectQuestionBank.length)}">
                                <span id="question-count-display-single">${Math.min(10, subjectQuestionBank.length)}</span>
                            </div>
                        </div>
                        <div class="setup-option-card">
                            <h4><span class="card-icon">⏱️</span> Test Mode</h4>
                            <p>Choose your challenge level.</p>
                            <div class="test-mode-selector">
                                <button class="test-mode-btn active" data-mode="practice">
                                    <span class="mode-title">Practice</span>
                                    <span class="mode-desc">No timer, just learn.</span>
                                </button>
                                <button class="test-mode-btn" data-mode="timed">
                                    <span class="mode-title">Timed (Per Q)</span>
                                    <span class="mode-desc">1 min per question.</span>
                                </button>
                                <button class="test-mode-btn" data-mode="timed-total">
                                    <span class="mode-title">Timed (Total)</span>
                                    <span class="mode-desc">Set a total duration.</span>
                                </button>
                            </div>
                            <div id="total-time-input-container-single" class="total-time-input-container hidden">
                                <label for="total-time-input-single">Total Time (minutes):</label>
                                <input type="number" id="total-time-input-single" value="15" min="1">
                            </div>
                        </div>
                    </div>
                    <button class="start-test-btn" id="start-test-btn-single">Start Test</button>
                </div>
            `;

            // Create sub-tabs and panes
            container.innerHTML = `
                <div class="topic-tabs">
                    <button class="topic-tab active" data-target="${subjectId}-all-questions">All Questions</button>
                    <button class="topic-tab" data-target="${subjectId}-take-quiz">Take a Quiz</button>
                </div>
                <div class="topic-contents">
                    <div id="${subjectId}-all-questions" class="topic-pane active" data-animate-list>
                        ${allQuestionsHtml}
                    </div>
                    <div id="${subjectId}-take-quiz" class="topic-pane">
                        ${quizSetupHtml}
                    </div>
                </div>
            `;

            // Animate the list of questions
            animateInElements(container.querySelectorAll('.all-questions-item'));

            // Add event listener for the new sub-tabs (All Questions / Take a Quiz)
            container.addEventListener('click', (e) => {
                if (e.target.matches('.topic-tab')) {
                    container.querySelectorAll('.topic-tab').forEach(btn => btn.classList.remove('active'));
                    container.querySelectorAll('.topic-pane').forEach(content => content.classList.remove('active'));

                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.target).classList.add('active');
                    if (e.target.dataset.target.endsWith('-all-questions')) {
                        animateInElements(document.getElementById(e.target.dataset.target).querySelectorAll('.all-questions-item'));
                    }
                }
            });

            // Add event listeners for new interactive quiz setup
            const slider = container.querySelector('#num-questions-slider-single');
            const countDisplay = container.querySelector('#question-count-display-single');
            if (slider && countDisplay) {
                slider.addEventListener('input', () => {
                    countDisplay.textContent = slider.value;
                });
            }

            const totalTimeContainer = container.querySelector('#total-time-input-container-single');
            const modeSelectorContainer = container.querySelector('.test-mode-selector');
            if (modeSelectorContainer) {
                modeSelectorContainer.addEventListener('click', (e) => {
                    const targetBtn = e.target.closest('.test-mode-btn');
                    if (targetBtn) {
                        modeSelectorContainer.querySelectorAll('.test-mode-btn').forEach(btn => btn.classList.remove('active'));
                        targetBtn.classList.add('active');

                        // Show/hide total time input
                        const isTotalTime = targetBtn.dataset.mode === 'timed-total';
                        totalTimeContainer.classList.toggle('hidden', !isTotalTime);
                    }
                });
            }

            // Add event listener for start test button
            container.querySelector('#start-test-btn-single').addEventListener('click', (e) => {
                const numQuestions = parseInt(container.querySelector(`#num-questions-slider-single`).value);
                const testModeBtn = container.querySelector(`.test-mode-btn.active`);
                const testMode = testModeBtn.dataset.mode;
                const totalTimeInput = container.querySelector('#total-time-input-single');
                const totalTime = testMode === 'timed-total' ? parseInt(totalTimeInput.value) : null;


                if (numQuestions > 0 && numQuestions <= subjectQuestionBank.length) {
                    startTest(subjectQuestionBank, numQuestions, testMode, false, totalTime, { semKey, subjectKey });
                } else {
                    alert(`Please enter a number between 1 and ${subjectQuestionBank.length}.`);
                }
            });
        } else {
            container.innerHTML = '<p>No objective questions available for this subject yet.</p>';
        }
    }

    function renderSubjectiveForSubject(container, subjectData, semKey, subjectKey) {

        // Correctly find topics that have subjective questions
        const unitsWithQs = Object.keys(subjectData).filter(unitKey => 
            subjectData[unitKey] && Array.isArray(subjectData[unitKey].subjectiveQuestions) && subjectData[unitKey].subjectiveQuestions.length > 0
        );
        if (unitsWithQs.length > 0) {
            const unitTabsContainer = document.createElement('div');
            unitTabsContainer.className = 'topic-tabs';
            const unitContentsContainer = document.createElement('div');
            unitContentsContainer.className = 'topic-contents';

            unitsWithQs.forEach((unitKey, unitIndex) => {
                const unitData = subjectData[unitKey];
                const unitId = `${semKey}-${subjectKey.replace(/\s+/g, '-')}-subjective-${unitKey.replace(/\s+/g, '-')}`;
                
                const unitTab = document.createElement('button');
                unitTab.className = 'topic-tab';
                unitTab.textContent = unitKey;
                unitTab.dataset.target = unitId;
                unitTabsContainer.appendChild(unitTab);

                const unitContent = document.createElement('div');
                unitContent.className = 'topic-pane';
                unitContent.id = unitId;

                unitData.subjectiveQuestions.forEach((sq, i) => {
                    const qContainer = document.createElement('div');
                    qContainer.className = 'subjective-question-container';
                    qContainer.innerHTML = `
                        <p class="subjective-question"><strong>Q${i + 1}:</strong> ${sq.question}</p>
                        <button class="toggle-answer-btn">Show Answer</button>
                        <div class="subjective-answer hidden">
                            ${sq.answer}
                        </div>
                    `;
                    unitContent.appendChild(qContainer);
                    const answerDiv = qContainer.querySelector('.subjective-answer');
                    answerDiv.querySelectorAll('pre').forEach(preElement => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'code-block-wrapper';
                        const copyButton = document.createElement('button');
                        copyButton.className = 'copy-code-btn';
                        copyButton.innerHTML = '📋 <span class="copy-text">Copy</span>';
                        copyButton.title = 'Copy code to clipboard';
                        wrapper.appendChild(copyButton);
                        preElement.parentNode.insertBefore(wrapper, preElement);
                        wrapper.appendChild(preElement);
                    });
                });

                highlightCodeInContainer(unitContent); // Apply syntax highlighting
                animateInElements(unitContent.querySelectorAll('.subjective-question-container'));
                unitContentsContainer.appendChild(unitContent);

                if (unitIndex === 0) {
                    unitTab.classList.add('active');
                    unitContent.classList.add('active');
                }
            });

            container.appendChild(unitTabsContainer);
            container.appendChild(unitContentsContainer);

            unitTabsContainer.addEventListener('click', (e) => {
                if (e.target.matches('.topic-tab')) {
                    unitTabsContainer.querySelectorAll('.topic-tab').forEach(btn => btn.classList.remove('active'));
                    unitContentsContainer.querySelectorAll('.topic-pane').forEach(content => content.classList.remove('active'));
                    e.target.classList.add('active');
                    document.getElementById(e.target.dataset.target).classList.add('active');
                    animateInElements(document.getElementById(e.target.dataset.target).querySelectorAll('.subjective-question-container'));
                }
            });
            addAnswerToggleLogic(container);
        } else {
            container.innerHTML = '<p>No subjective questions available for this subject yet.</p>';
        }
    }

    /**
     * Finds and applies syntax highlighting to all code blocks within a given container.
     * @param {HTMLElement} container The parent element to search within.
     */
    function highlightCodeInContainer(container) {
        container.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
    }
    let testTimer;

    function startTest(questionBank, numQuestions, testMode, isRandomQuiz = false, totalTime = null, subjectContext = null) {
        // Shuffle and slice questions
        const testQuestions = [...questionBank].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
        const userAnswers = new Array(numQuestions).fill(null);
        let currentQuestionIndex = 0;
 
        const testContainer = enterSpecialView();
        testContainer.innerHTML = `
            <div class="qb-test-container" style="margin: 20px auto;">
                <div class="qb-test-main">
                    <div class="qb-test-content"></div>
                </div>
                <div class="qb-question-palette"></div>
            </div>
        `;
        const testMainContainer = testContainer.querySelector('.qb-test-main');
        const paletteContainer = testContainer.querySelector('.qb-question-palette');

        function renderQuestion(index) {            currentQuestionIndex = index;
            const testContentContainer = testContainer.querySelector('.qb-test-content');
            // Re-render the palette to update the current question highlight
            renderQuestionPalette();

            const question = testQuestions[index];
            const optionsHtml = question.options.map((option, i) => {
                const isChecked = userAnswers[index] === i;
                return `
                    <label>
                        <input type="radio" name="option" value="${i}" ${isChecked ? 'checked' : ''}>
                        ${option}
                    </label>
                `;
            }).join('');

            testContentContainer.innerHTML = `
                <div class="qb-test-header">
                    <span>Question ${index + 1} of ${numQuestions}</span>
                    <button id="fullscreen-btn" class="fullscreen-toggle-btn" title="Toggle Fullscreen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        <span class="btn-text">Fullscreen</span>
                    </button>
                    <span id="qb-timer"></span>
                </div>
                <div class="qb-question">
                    <p>${question.question}</p>
                    <div class="quiz-options-wrapper">
                        <div class="quiz-options">${optionsHtml}</div>
                        <button id="clear-selection-btn" class="qb-nav-btn secondary-action clear-selection-btn">Clear Selection</button>
                    </div>
                </div>
                <div class="qb-navigation">
                    <button id="prev-btn" class="qb-nav-btn">Previous</button>
                    <button id="next-btn" class="qb-nav-btn">Next</button>
                    <button id="submit-btn" class="qb-nav-btn">Submit</button>
                </div>
            `;

            document.getElementById('fullscreen-btn').addEventListener('click', () => {
                const docEl = document.documentElement;
                const isInFullscreen = document.fullscreenElement || document.webkitFullscreenElement;

                if (!isInFullscreen) {
                    if (docEl.requestFullscreen) {
                        docEl.requestFullscreen();
                    } else if (docEl.webkitRequestFullscreen) { /* Safari */
                        docEl.webkitRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) { /* Safari */
                        document.webkitExitFullscreen();
                    }
                }
            });
            document.getElementById('prev-btn').disabled = index === 0;
            document.getElementById('next-btn').disabled = index === numQuestions - 1;
            document.getElementById('submit-btn').style.display = (index === numQuestions - 1) ? 'inline-block' : 'none';

            document.getElementById('prev-btn').addEventListener('click', () => navigate(-1));
            document.getElementById('next-btn').addEventListener('click', () => navigate(1));
            document.getElementById('submit-btn').addEventListener('click', showResults);
            document.getElementById('clear-selection-btn').addEventListener('click', () => {
                userAnswers[currentQuestionIndex] = null;
                const radios = testContentContainer.querySelectorAll('input[name="option"]');
                radios.forEach(radio => radio.checked = false);
                renderQuestionPalette();
            });

            testContentContainer.querySelectorAll('input[name="option"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    userAnswers[currentQuestionIndex] = parseInt(e.target.value);
                    // Update palette color when an answer is selected
                    renderQuestionPalette();
                });
            });
        }


        function renderQuestionPalette() {
            paletteContainer.innerHTML = '<h4>Questions</h4>';
            const grid = document.createElement('div');
            grid.className = 'qb-palette-grid';
            for (let i = 0; i < numQuestions; i++) {
                const button = document.createElement('button');
                button.textContent = i + 1;
                button.dataset.qIndex = i;
                button.className = 'qb-palette-btn';
                if (userAnswers[i] !== null) {
                    button.classList.add('attempted');
                } else {
                    button.classList.add('unattempted');
                }
                if (i === currentQuestionIndex) {
                    button.classList.add('current');
                }
                button.addEventListener('click', () => {
                    renderQuestion(i);
                });
                grid.appendChild(button);
            }
            paletteContainer.appendChild(grid);
        }

        function navigate(direction) {
            renderQuestion(currentQuestionIndex + direction);
        }

        function buildReviewView(questions, answers) {
            const reviewContainerWrapper = enterSpecialView();
            reviewContainerWrapper.innerHTML = `
                <div class="review-container">
                    <h2>Review Your Answers</h2>
                    <button id="back-to-hub-from-review" class="back-button">← Back to Study Hub</button>
                </div>
            `;
            const reviewContainer = reviewContainerWrapper.querySelector('.review-container');

            questions.forEach((q, i) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'review-question';

                let optionsHtml = '';
                q.options.forEach((option, optIndex) => {
                    let classes = '';
                    if (optIndex === q.correct) {
                        classes += ' correct-answer';
                    }
                    if (optIndex === answers[i] && answers[i] !== q.correct) {
                        classes += ' incorrect-answer';
                    }

                    optionsHtml += `<label class="${classes.trim()}">${option}</label>`;
                });

                questionDiv.innerHTML = `
                    <p><strong>Q${i + 1}:</strong> ${q.question}</p>
                    <div class="review-options">${optionsHtml}</div>
                `;
                reviewContainer.appendChild(questionDiv);
            });

            // Add listener for the new back to hub button
            document.getElementById('back-to-hub-from-review').addEventListener('click', () => {
                returnToStudyHub();
            });

            const backButton = document.createElement('button');
            backButton.id = 'back-to-qb-btn';
            backButton.className = 'qb-nav-btn';
            backButton.textContent = 'Back to Test Selection';
            backButton.style.marginTop = '20px';
            backButton.addEventListener('click', () => {
                if (isRandomQuiz) {
                    returnToStudyHub();
                } else {
                    // Go back to the subject's question bank view.
                    const subjectPane = document.querySelector(`.subject-pane-main.active`);
                    const qbButton = subjectPane.querySelector('.content-type-btn[data-mode-id="question-bank"]');
                    qbButton?.click();
                }
            });
            reviewContainer.appendChild(backButton);
        }

        function showResults() {
            clearInterval(testTimer);
            let score = 0;
            testQuestions.forEach((q, i) => {
                if (userAnswers[i] === q.correct) { // Strict equality is fine here
                    score++;
                }
            });
            const percentage = (score / numQuestions) * 100;
            const strokeDasharray = 2 * Math.PI * 54; // Circumference of the circle
            const strokeDashoffset = strokeDasharray * (1 - percentage / 100);

            const resultsContainerWrapper = enterSpecialView();
            resultsContainerWrapper.innerHTML = `
                <div class="qb-results-container improved-results">
                    <h2 class="results-title">Test Complete!</h2>
                    <div class="results-summary">
                        <div class="score-chart">
                            <svg viewBox="0 0 120 120">
                                <circle class="score-bg" cx="60" cy="60" r="54"/>
                                <circle class="score-fill" cx="60" cy="60" r="54"
                                    stroke-dasharray="${strokeDasharray}"
                                    stroke-dashoffset="${strokeDashoffset}"
                                />
                            </svg>
                            <div class="score-text">
                                <span class="score-percentage">${percentage.toFixed(0)}%</span>
                                <span class="score-fraction">${score}/${numQuestions}</span>
                            </div>
                        </div>
                        <div class="results-details">
                            <p>Great effort! Keep practicing to improve your score.</p>
                        </div>
                    </div>
                    <div class="qb-results-navigation">
                        <button id="review-btn" class="qb-nav-btn">Review Answers</button>
                        <button id="restart-btn" class="qb-nav-btn">${isRandomQuiz ? 'Try Another Random Quiz' : 'Take Another Test'}</button>
                        <button id="back-to-hub-from-results" class="qb-nav-btn secondary-action">Back to Study Hub</button>
                    </div>
                </div>
            `;
            document.getElementById('restart-btn').addEventListener('click', () => {
                if (isRandomQuiz) {
                    startRandomQuiz();
                } else {
                    // The previous UI is gone. We need to rebuild it and then navigate.
                    const { semKey, subjectKey } = subjectContext;
                    
                    // 1. Restore the main app structure
                    buildAppUI(fullData);

                    // 2. Navigate to the correct semester and subject
                    document.querySelector(`.semester-tab-main[data-target="sem-pane-${semKey.split('-')[1]}"]`)?.click();
                    document.querySelector(`.subject-tab-secondary[data-target="${semKey}-${subjectKey.replace(/\s+/g, '-')}"]`)?.click();

                    // 3. Navigate to the "Objective Qs" content type, which will render the quiz tab
                    const subjectPane = document.getElementById(`${semKey}-${subjectKey.replace(/\s+/g, '-')}`);
                    const quizTabButton = subjectPane?.querySelector('.content-type-btn[data-mode-id="question-bank"]');
                    quizTabButton?.click();
                }
                returnToStudyHub();
            });
            document.getElementById('back-to-hub-from-results').addEventListener('click', () => { 
                returnToStudyHub();
            });
            document.getElementById('review-btn').addEventListener('click', () => buildReviewView(testQuestions, userAnswers));
        }

        if (testMode === 'timed' || testMode === 'timed-total') {
            let timeLeft = testMode === 'timed' ? numQuestions * 60 : totalTime * 60;
            const timerEl = document.getElementById('qb-timer');
            clearInterval(testTimer); // Clear any previous timers
            testTimer = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                if (document.getElementById('qb-timer')) {
                    document.getElementById('qb-timer').textContent = 
                        `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                }

                if (timeLeft <= 0) {
                    clearInterval(testTimer);
                    alert("Time's up!");
                    showResults();
                }
            }, 1000);
        }

        renderQuestion(0); // Start with the first question
    }

    function showCustomThemeEditor() {
        const modalOverlay = document.getElementById('custom-theme-modal-overlay');
        const modal = document.getElementById('custom-theme-modal');
        modalOverlay.classList.remove('hidden');
        modal.classList.add('wide-modal');

        const currentTheme = document.body.dataset.theme || 'light';
        const rootStyles = getComputedStyle(document.documentElement);

        const defaultColors = {
            '--bg-main': rootStyles.getPropertyValue('--bg-main').trim(),
            '--text-primary': rootStyles.getPropertyValue('--text-primary').trim(),
            '--accent-color': rootStyles.getPropertyValue('--accent-color').trim(),
            '--card-bg': rootStyles.getPropertyValue('--card-bg').trim(),
        };

        const savedCustomColors = JSON.parse(localStorage.getItem('customThemeColors'));
        const initialColors = savedCustomColors || defaultColors;

        modal.innerHTML = `
            <div class="theme-editor-header">
                <div class="theme-editor-title">
                    <h2>🎨 Theme Studio</h2>
                    <p>Craft your perfect look. Changes are reflected live in the preview.</p>
                </div>
                <div class="theme-modal-actions">
                    <button id="reset-theme-btn" class="qb-nav-btn secondary-action">Reset</button>
                    <button id="cancel-theme-btn" class="cancel-btn">Cancel</button>
                    <button id="save-theme-btn" class="qb-nav-btn">Save & Apply</button>
                </div>
            </div>
            <div class="theme-editor-body">
                <div class="theme-editor-controls">
                    <div class="control-group">
                        <h4>Core Colors</h4>
                        <div class="theme-editor-item" data-color-var="--bg-main">
                            <label>Main Background</label>
                            <div class="color-input-wrapper"><input type="color"><input type="text" class="hex-input" maxlength="7"></div>
                        </div>
                        <div class="theme-editor-item" data-color-var="--card-bg">
                            <label>Surface / Card</label>
                            <div class="color-input-wrapper"><input type="color"><input type="text" class="hex-input" maxlength="7"></div>
                        </div>
                    </div>
                    <div class="control-group">
                        <h4>Text & Accent</h4>
                        <div class="theme-editor-item" data-color-var="--text-primary">
                            <label>Primary Text</label>
                            <div class="color-input-wrapper"><input type="color"><input type="text" class="hex-input" maxlength="7"></div>
                        </div>
                        <div class="theme-editor-item" data-color-var="--accent-color">
                            <label>Accent Color</label>
                            <div class="color-input-wrapper"><input type="color"><input type="text" class="hex-input" maxlength="7"></div>
                        </div>
                    </div>

                </div>
                <div class="theme-preview-container">
                    <div id="theme-preview-area" class="theme-preview-area">
                        <div class="preview-content">
                            <div class="preview-tabs">
                                <div class="preview-tab active">Unit 1</div>
                                <div class="preview-tab">Unit 2</div>
                            </div>
                            <div class="preview-main-content">
                                <div class="preview-card">
                                    <span class="point-icon">🔹</span>
                                    <div class="point-text">This is a sample key point to preview readability and style.</div>
                                </div>
                                <div class="preview-card">
                                    <span class="point-icon">🔹</span>
                                    <div class="point-text">Your accent color will be used for buttons and highlights.</div>
                                </div>
                                <button class="preview-button">Accent Button</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const previewArea = document.getElementById('theme-preview-area');

        const updatePreview = () => {
            const bgMain = modal.querySelector('[data-color-var="--bg-main"] input[type="color"]').value;
            const cardBg = modal.querySelector('[data-color-var="--card-bg"] input[type="color"]').value;
            const textPrimary = modal.querySelector('[data-color-var="--text-primary"] input[type="color"]').value;
            const accent = modal.querySelector('[data-color-var="--accent-color"] input[type="color"]').value;
            
            // Derive other colors for preview
            const textSecondary = isColorDark(textPrimary) ? '#ffffff' : '#000000';
            const tabInactiveBg = mixColor(cardBg, bgMain, 0.7);
            const tabInactiveText = mixColor(textPrimary, bgMain, 0.7);
            const accentText = isColorDark(accent) ? '#FFFFFF' : '#000000';

            previewArea.style.setProperty('--preview-bg-main', bgMain);
            previewArea.style.setProperty('--preview-card-bg', cardBg);
            previewArea.style.setProperty('--preview-text-primary', textPrimary);
            previewArea.style.setProperty('--preview-text-secondary', textSecondary);
            previewArea.style.setProperty('--preview-accent-color', accent);
            previewArea.style.setProperty('--preview-accent-text', accentText);
            previewArea.style.setProperty('--preview-tab-inactive-bg', tabInactiveBg);
            previewArea.style.setProperty('--preview-tab-inactive-text', tabInactiveText);
        };

        modal.querySelectorAll('.theme-editor-item').forEach(item => {
            const colorVar = item.dataset.colorVar;
            const colorInput = item.querySelector('input[type="color"]');
            const hexInput = item.querySelector('.hex-input');

            const setColor = (color) => {
                colorInput.value = color;
                hexInput.value = color;
            };

            setColor(initialColors[colorVar]);

            colorInput.addEventListener('input', () => {
                hexInput.value = colorInput.value;
                updatePreview();
            });

            hexInput.addEventListener('input', () => {
                const val = hexInput.value;
                if (/^#[0-9A-F]{6}$/i.test(val)) {
                    colorInput.value = val;
                    updatePreview();
                }
            });
        });

        updatePreview(); // Initial preview

        document.getElementById('save-theme-btn').addEventListener('click', () => {
            const customColors = {
                '--bg-main': modal.querySelector('[data-color-var="--bg-main"] input[type="color"]').value,
                '--card-bg': modal.querySelector('[data-color-var="--card-bg"] input[type="color"]').value,
                '--text-primary': modal.querySelector('[data-color-var="--text-primary"] input[type="color"]').value,
                '--accent-color': modal.querySelector('[data-color-var="--accent-color"] input[type="color"]').value,
            };

            // Auto-generate secondary colors
            const textPrimary = customColors['--text-primary'];
            customColors['--text-secondary'] = isColorDark(textPrimary) ? '#ffffff' : '#000000';
            customColors['--text-tertiary'] = mixColor(textPrimary, customColors['--bg-main'], 0.8);
            customColors['--border-color'] = mixColor(customColors['--card-bg'], customColors['--bg-main'], 0.5);
            customColors['--tab-inactive-bg'] = mixColor(customColors['--card-bg'], customColors['--bg-main'], 0.7);
            customColors['--tab-inactive-text'] = mixColor(textPrimary, customColors['--bg-main'], 0.7);
            customColors['--card-shadow'] = `0 4px 15px ${hexToRgba(customColors['--accent-color'], 0.1)}`;

            localStorage.setItem('customThemeColors', JSON.stringify(customColors));
            applyTheme(customThemeKey);
            modal.classList.remove('wide-modal');
            modalOverlay.classList.add('hidden');
        });

        document.getElementById('cancel-theme-btn').addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
            modal.classList.remove('wide-modal');
            applyTheme(localStorage.getItem('studyHubTheme') || 'light'); // Revert to saved theme
        });

        document.getElementById('reset-theme-btn').addEventListener('click', () => {
            modal.querySelectorAll('.theme-editor-item').forEach(item => {
                const colorVar = item.dataset.colorVar;
                item.querySelector('input[type="color"]').value = defaultColors[colorVar];
                item.querySelector('.hex-input').value = defaultColors[colorVar];
            });
            updatePreview();
        });
    }

    function applyCustomThemeStyles() {
        const customColors = JSON.parse(localStorage.getItem('customThemeColors'));
        if (!customColors) return;

        let styleEl = document.getElementById('custom-theme-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'custom-theme-styles';
            document.head.appendChild(styleEl);
        }

        const css = `
            [data-theme="custom"] {
                ${Object.entries(customColors).map(([key, value]) => `${key}: ${value};`).join('\n')}
            }
        `;
        styleEl.innerHTML = css;
    }

    // --- Color Helper Functions ---
    function isColorDark(hex) {
        const [r, g, b] = hexToRgb(hex);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    }

    function hexToRgb(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
            r = parseInt(hex[1] + hex[2], 16);
            g = parseInt(hex[3] + hex[4], 16);
            b = parseInt(hex[5] + hex[6], 16);
        }
        return [r, g, b];
    }

    function hexToRgba(hex, alpha) {
        const [r, g, b] = hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function mixColor(color1, color2, weight) {
        const w1 = weight;
        const w2 = 1 - w1;
        const [r1, g1, b1] = hexToRgb(color1);
        const [r2, g2, b2] = hexToRgb(color2);
        const r = Math.round(r1 * w1 + r2 * w2);
        const g = Math.round(g1 * w1 + g2 * w2);
        const b = Math.round(b1 * w1 + b2 * w2);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function buildProfileView(container) {
        container.innerHTML = ''; // Clear content for special view
        if (!currentUser) {
            container.innerHTML = `<h2>Please log in to view your profile.</h2>`;
            return;
        }
        container.innerHTML = `
            <div class="profile-container">
                <h2>User Profile</h2>
                <form id="profile-form">
                    <div class="form-group">
                        <label for="profile-displayName">Display Name</label>
                        <input type="text" id="profile-displayName" name="displayName" value="${currentUser.displayName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="profile-email">Email</label>
                        <input type="email" id="profile-email" name="email" value="${currentUser.email || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profile-branch">Branch</label>
                        <input type="text" id="profile-branch" name="branch" value="${currentUser.branch || ''}" placeholder="e.g., COE, SE, IT">
                    </div>
                    <div class="form-group">
                        <label for="profile-year">Year of College</label>
                        <input type="number" id="profile-year" name="year" value="${currentUser.year || ''}" placeholder="e.g., 1, 2, 3, 4">
                    </div>
                    <button type="submit" class="profile-update-btn">Update Profile</button>
                    <div class="feedback"></div>
                </form>
            </div>
        `;

        const profileForm = document.getElementById('profile-form');
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const feedbackEl = profileForm.querySelector('.feedback');
            const displayName = document.getElementById('profile-displayName').value;
            const branch = document.getElementById('profile-branch').value;
            const year = document.getElementById('profile-year').value;
            const submitButton = profileForm.querySelector('.profile-update-btn');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Updating...';
            submitButton.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/api/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },                    
                    credentials: 'include',
                    body: JSON.stringify({ displayName, branch, year })
                });
                const result = await response.json();
                if (response.ok) {
                    feedbackEl.textContent = 'Profile updated successfully!';
                    feedbackEl.style.color = '#27ae60';
                    currentUser.displayName = displayName; // Update local user object
                    currentUser.branch = branch;
                    currentUser.year = year;
                    
                    // Update local user object with returned data
                    currentUser.displayName = result.displayName;
                    currentUser.branch = result.branch;
                    currentUser.year = result.year;
                    if (result.photo) {
                        currentUser.photo = result.photo;
                    }

                    renderHeader(); // Re-render header to show new name

                } else {
                    throw new Error(result.error || 'Failed to update profile.');
                }
            } catch (error) {
                feedbackEl.textContent = error.message;
                feedbackEl.style.color = '#e74c3c';
            }
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    }

    function buildAthenaView(container) {
        let activeChatId = null; // To track the current conversation
        let chats = []; // To store the list of chats'

        container.innerHTML = ''; // Clear content for special view
        // Create a new centered container for the chat UI
        const athenaContainer = document.createElement('div');
        athenaContainer.className = 'athena-view-container';
        container.appendChild(athenaContainer);

        // Build the entire Athena UI structure at once to ensure all elements are available.
        athenaContainer.innerHTML = `
            <div class="athena-view-spacer"></div>
            <div class="athena-chat-page" id="athena-chat-page">
                <div class="athena-sidebar">
                    <div class="athena-sidebar-header">
                        <h3 class="sidebar-title">Conversations</h3> 
                        <button id="new-chat-btn" title="New Chat"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                    <div class="chat-history-list" id="chat-history-list">
                        <!-- Chat history will be loaded here -->
                        <p class="loading-text">Loading chats...</p>
                    </div>
                </div>
                <div class="athena-chat-area"> 
                    <div class="chat-messages" id="chat-messages"><!-- Welcome screen or messages will be loaded here --></div>
                    <div class="chat-input-area">
                        <div id="chat-file-preview-container" class="hidden">
                            <span id="chat-file-preview-name"></span>
                            <button type="button" id="chat-file-remove-btn" title="Remove file">&times;</button>
                        </div>
                        <div class="chat-input-form">
                            <input type="file" id="chat-file-input" class="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp">
                            <div class="attach-menu-container">
                                <div id="attach-file-menu" class="attach-file-menu hidden">
                                    <button type="button" class="attach-option-btn" data-type="pdf" title="Upload PDF"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10.5 20H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l5 5v2"></path><path d="M14.5 18H20a2 2 0 0 0 2-2v-2.5"></path><path d="M20 15.5h-5.5V21"></path></svg><span>PDF</span></button>
                                    <button type="button" class="attach-option-btn" data-type="image" title="Upload Image"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>Image</span></button>
                                </div>
                                <button type="button" id="attach-file-btn" title="Attach File"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                            </div>
                            <form class="chat-input-form-main">
                                <textarea id="chat-input" placeholder="Ask Athena anything..." rows="1"></textarea>
                                <button id="send-btn" title="Send Message" type="submit"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button> 
                            </form>
                        </div>
                        <p class="athena-disclaimer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="disclaimer-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            <span>Athena can provide inaccurate information sometimes. Please verify critical responses.</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="athena-bottom-spacer"></div>
        `;

        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        const newChatBtn = document.getElementById('new-chat-btn');
        const filePreviewContainer = document.getElementById('chat-file-preview-container');
        const filePreviewName = document.getElementById('chat-file-preview-name');
        const removeFileBtn = document.getElementById('chat-file-remove-btn');
        const attachFileBtn = document.getElementById('attach-file-btn');
        const fileInput = document.getElementById('chat-file-input');
        const attachMenu = document.getElementById('attach-file-menu');
        const athenaPage = document.getElementById('athena-chat-page');

        // --- Auto-growing Textarea Logic ---
        const adjustTextareaHeight = () => {
            // Temporarily reset height to calculate the new required height
            chatInput.style.height = 'auto';
            // Set the height to the scroll height, which is the minimum height for the content
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        };
        chatInput.addEventListener('input', adjustTextareaHeight);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }); // Prevent default Enter behavior

        // --- Attach File Logic ---
        attachFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            attachMenu.classList.toggle('hidden');
            attachFileBtn.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!attachMenu.contains(e.target) && !attachFileBtn.contains(e.target)) {
                attachMenu.classList.add('hidden');
                attachFileBtn.classList.remove('active');
            }
        });

        // Handle menu option clicks
        attachMenu.addEventListener('click', (e) => {
            const button = e.target.closest('.attach-option-btn');
            if (button) {
                const type = button.dataset.type;
                if (type === 'pdf') {
                    fileInput.accept = '.pdf';
                } else if (type === 'image') {
                    fileInput.accept = '.png,.jpg,.jpeg,.webp';
                }
                fileInput.click();
                attachMenu.classList.add('hidden');
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                filePreviewName.textContent = fileInput.files[0].name;
                filePreviewContainer.classList.remove('hidden');
            }
        });

        removeFileBtn.addEventListener('click', () => {
            fileInput.value = ''; // Clear the selected file
            filePreviewContainer.classList.add('hidden');
            filePreviewName.textContent = '';
        });


        // --- Event Delegation for Chat Actions (Copy) ---
        chatMessages.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.chat-copy-btn');
            if (copyBtn) {
                const messageEl = copyBtn.closest('.chat-message.bot');
                const textToCopy = messageEl.querySelector('.message-content').innerText;

                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✅';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalIcon;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Could not copy text.');
                });
            }
        });

        function renderChatHistory() {
            const chatHistoryList = document.getElementById('chat-history-list');
            chatHistoryList.innerHTML = '';
            if (chats.length === 0) {
                chatHistoryList.innerHTML = '<p class="loading-text">No conversations yet. Start a new one!</p>';
                return;
            }

            // Sort chats by most recently updated
            chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            chats.forEach(renderSingleChatItem);
        }

        async function loadChatHistory() {
            if (!currentUser) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/chats`, { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch chats.');
                chats = await response.json();
                
                if (chats.length > 0) {
                    // Make the most recent chat active by default
                    activeChatId = chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]._id;
                    await switchChat(activeChatId);
                } else {
                    activeChatId = null;
                    await switchChat(null); // Explicitly show welcome screen
                }
                renderChatHistory();
            } catch (error) {
                console.error(error);
                document.getElementById('chat-history-list').innerHTML = '<p class="loading-text">Could not load chats.</p>';
            }
        }

        /**
         * A modern, promise-based replacement for the native `confirm()`.
         * @param {object} options - The options for the confirmation modal.
         * @param {string} options.title - The title for the modal.
         * @param {string} options.message - The confirmation message.
         * @param {string} [options.confirmText='Delete'] - The text for the confirm button.
         * @param {string} [options.cancelText='Cancel'] - The text for the cancel button.
         * @returns {Promise<boolean>} A promise that resolves with `true` if confirmed, or `false` if canceled.
         */
        function customConfirm({ title, message, confirmText = 'Delete', cancelText = 'Cancel' }) {
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.className = 'prompt-modal-overlay';
                overlay.innerHTML = `
                    <div class="prompt-modal">
                        <h3>${title}</h3>
                        <p class="prompt-modal-message">${message}</p>
                        <div class="prompt-modal-actions">
                            <button class="qb-nav-btn secondary-action" id="prompt-cancel-btn">${cancelText}</button>
                            <button class="qb-nav-btn danger-action" id="prompt-ok-btn">${confirmText}</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                const okBtn = document.getElementById('prompt-ok-btn');
                const cancelBtn = document.getElementById('prompt-cancel-btn');

                okBtn.focus();

                const close = (value) => {
                    document.body.removeChild(overlay);
                    resolve(value);
                };

                okBtn.addEventListener('click', () => close(true));
                cancelBtn.addEventListener('click', () => close(false));
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) close(false);
                });
            });
        }

        async function deleteChat(chatId) {
            const confirmed = await customConfirm({
                title: 'Delete Chat?',
                message: 'This will permanently delete the conversation. This action cannot be undone.'
            });
            if (confirmed) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Failed to delete chat.');

                    chats = chats.filter(c => c._id !== chatId);

                    if (activeChatId === chatId) {
                        const mostRecentChat = chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                        activeChatId = mostRecentChat ? mostRecentChat._id : null;
                        await switchChat(activeChatId);
                    } else {
                        // If a non-active chat was deleted, we just need to re-render the list
                        renderChatHistory();
                    }

                } catch (error) {
                    console.error(error);
                    alert('Could not delete chat.');
                }
            }
        }

        function renderSingleChatItem(chat) {
            const chatHistoryList = document.getElementById('chat-history-list');
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            item.dataset.chatId = chat._id;

            const titleSpan = document.createElement('span');
            titleSpan.className = 'chat-history-title';
            titleSpan.textContent = chat.title;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'chat-item-actions';
            actionsDiv.innerHTML = `
                <button class="chat-action-btn rename-btn" title="Rename">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button class="chat-action-btn delete-btn" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;

            item.appendChild(titleSpan);
            item.appendChild(actionsDiv);

            if (chat._id === activeChatId) {
                item.classList.add('active');
            }

            // Event listeners
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    switchChat(chat._id);
                }
            });

            actionsDiv.querySelector('.rename-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                renameChat(chat._id, chat.title);
            });

            actionsDiv.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChat(chat._id);
            });

            chatHistoryList.appendChild(item);
        }

        /**
         * A modern, promise-based replacement for the native `prompt()`.
         * @param {string} title - The title for the modal.
         * @param {object} options - The options for the confirmation modal.
         * @param {string} options.title - The title for the modal.
         * @param {string} [defaultValue=''] - The initial value for the input field.
         * @param {string} [options.confirmText='OK'] - The text for the confirm button.
         * @param {string} [options.cancelText='Cancel'] - The text for the cancel button.
         * @returns {Promise<string|null>} A promise that resolves with the input value or null if canceled.
         */
        function customPrompt({ title, defaultValue = '', confirmText = 'OK', cancelText = 'Cancel' }) {
            return new Promise((resolve) => {
                const overlay = document.createElement('div');
                overlay.className = 'prompt-modal-overlay';
                overlay.innerHTML = `
                    <div class="prompt-modal">
                        <h3>${title}</h3>
                        <input type="text" id="custom-prompt-input" value="${defaultValue}" spellcheck="false">
                        <div class="prompt-modal-actions">
                            <button class="qb-nav-btn secondary-action" id="prompt-cancel-btn">${cancelText}</button>
                            <button class="qb-nav-btn" id="prompt-ok-btn">${confirmText}</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                const input = document.getElementById('custom-prompt-input');
                const okBtn = document.getElementById('prompt-ok-btn');
                const cancelBtn = document.getElementById('prompt-cancel-btn');

                input.focus();
                input.select();

                const close = (value) => {
                    document.body.removeChild(overlay);
                    resolve(value);
                };

                okBtn.addEventListener('click', () => close(input.value));
                cancelBtn.addEventListener('click', () => close(null));
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) close(null);
                });
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') okBtn.click();
                });
            });
        }

        async function createNewChat() {
            const title = await customPrompt({
                title: "New Conversation", 
                defaultValue: "New Chat",
                confirmText: 'Create',
                cancelText: 'Cancel'
            });
            if (title) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/new-chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ title })
                    });
                    if (!response.ok) throw new Error('Failed to create chat.');
                    const newChat = await response.json();
                    
                    chats.push({ _id: newChat.chatId, title: newChat.title, updatedAt: new Date() });
                    await switchChat(newChat.chatId);
                    renderChatHistory();
                } catch (error) {
                    console.error(error);
                    alert('Could not create new chat.');
                }
            }
        }

        async function renameChat(chatId, oldTitle) {
            const newTitle = await customPrompt({
                title: "Rename Chat",
                defaultValue: oldTitle,
                confirmText: 'Rename',
                cancelText: 'Cancel'
            });
            if (newTitle && newTitle.trim() !== '' && newTitle !== oldTitle) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/rename`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ newTitle })
                    });
                    if (!response.ok) throw new Error('Failed to rename chat.');

                    const chatToUpdate = chats.find(c => c._id === chatId);
                    if (chatToUpdate) {
                        chatToUpdate.title = newTitle;
                    }
                    renderChatHistory();
                } catch (error) {
                    console.error(error);
                    alert('Could not rename chat.');
                }
            }
        }

        async function switchChat(chatId) {
            activeChatId = chatId;
            renderChatHistory(); // Update active highlight in the sidebar

            // If there's no active chat, show a welcome/default message and stop.
            if (!chatId) {
                chatMessages.innerHTML = `
                    <div class="athena-welcome-screen">
                        <div class="welcome-logo">
                            <div class="athena-icon"></div>
                        </div>
                        <h2>How can I help you today?</h2>
                        <div class="welcome-prompts">
                            <div class="prompt-card">Explain the concept of virtual memory</div>
                            <div class="prompt-card">Summarize the main points of Maxwell's equations</div>
                            <div class="prompt-card">Create a 5-question quiz on data structures</div>
                            <div class="prompt-card">Help me debug this Python code for sorting a list</div>
                        </div>
                    </div>
                `;
                // Add click listeners to prompt cards
                chatMessages.querySelectorAll('.prompt-card').forEach(card => card.addEventListener('click', () => chatInput.value = card.textContent));
                return;
            }

            chatMessages.innerHTML = '<p class="loading-text">Loading messages...</p>'; // Show loading indicator

            try {
                const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, { credentials: 'include' }); // Fetch messages for the valid chatId
                if (!response.ok) throw new Error('Failed to load messages.');
                const { messages } = await response.json();

                chatMessages.innerHTML = '';
                if (messages.length === 0) {
                     chatMessages.innerHTML = `<div class="chat-message bot">${marked.parse('This is a new chat. Ask me anything!')}</div>`;
                } else {
                    messages.forEach(msg => appendMessage(msg.content, msg.role));
                }
                // Defer scroll to the end of the event loop to ensure the DOM is updated
                // and the scrollHeight is correct before we try to scroll.
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 0);
            } catch (error) {
                console.error(error);
                chatMessages.innerHTML = `<div class="chat-message bot">${marked.parse('Sorry, I could not load this conversation.')}</div>`;
            }
        }

        const handleSend = async () => {
            const userMessageText = chatInput.value;
            const file = fileInput.files[0];

            if (!activeChatId) {
                alert("Please select or create a new chat first.");
                return;
            }
            if (!userMessageText.trim() && !file) return;
 
            // --- MODIFICATION START: Add a temporary ID for the optimistic message ---
            const optimisticId = `optimistic-${Date.now()}`;
            appendMessage(userMessageText, 'user', null, false, optimisticId);
            // --- MODIFICATION END ---

            const currentVal = chatInput.value;
            chatInput.value = '';
            removeFileBtn.click(); // Programmatically click remove to clear file input and UI
            adjustTextareaHeight(); // Reset height after clearing
            chatMessages.scrollTop = chatMessages.scrollHeight;
    
            // Add a "thinking" indicator immediately
            const thinkingWrapper = document.createElement('div');
            thinkingWrapper.className = 'chat-message-wrapper assistant';
            thinkingWrapper.id = 'thinking-indicator'; // Give it an ID for easy removal
            const avatarHtml = `<div class="chat-avatar bot-avatar"><div class="athena-icon"></div></div>`;
            const thinkingBubbleHtml = `<div class="chat-message bot"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
            thinkingWrapper.innerHTML = `${avatarHtml}${thinkingBubbleHtml}`;
            chatMessages.appendChild(thinkingWrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
    
            try {
                const formData = new FormData();
                formData.append('chatId', activeChatId);
                formData.append('userMessage', currentVal);
                if (file) {
                    formData.append('file', file);
                }

                const response = await fetch(`${API_BASE_URL}/api/chat`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData // No 'Content-Type' header needed, browser sets it for FormData
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Network response was not ok');
                }
                const { userMessage: userMessageData, assistantMessage: assistantMessageData } = await response.json();

                const optimisticUserMessage = document.getElementById(optimisticId);
                if (optimisticUserMessage) {
                    optimisticUserMessage.remove();
                }
                appendMessage(userMessageData.content, 'user', userMessageData.file, false, userMessageData._id);

                appendMessage(assistantMessageData.content, 'assistant', null, false, assistantMessageData._id);
            } catch (error) {
                thinkingWrapper.remove(); // Remove thinking indicator on error
                appendMessage(`Sorry, I encountered an error: ${error.message}`, 'assistant', null, true, null);
                console.error('Fetch error:', error);
            }
     highlightCodeInContainer(messageWrapper); // Apply syntax highlighting to the new message
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        /**
         * Appends a bot message to the chat, handling thinking indicators.
         * @param {string} role The role of the sender ('user' or 'assistant').
         * @param {string} content The message content (can be HTML).
         * @param {object|null} fileData Object containing file info {name, url, type}.
         * @param {boolean} isError If the message is an error message.
         */
        function appendMessage(content, role, fileData = null, isError = false, messageId = null) {
            // --- MODIFICATION START: Handle temporary optimistic ID ---
            if (messageId && messageId.startsWith('optimistic-')) {
                const wrapper = document.createElement('div');
                wrapper.id = messageId;
            } // --- MODIFICATION END ---
            const messageWrapper = document.createElement('div');
            messageWrapper.className = `chat-message-wrapper ${role}`;
            let avatarHtml = '';
            if (role === 'user' && currentUser?.photo) {
                avatarHtml = `<img src="${currentUser.photo}" alt="You" class="chat-avatar">`;
            } else if (role === 'user') {
                const initial = currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U';
                avatarHtml = `<div class="chat-avatar default">${initial}</div>`;
            } else { // bot
                avatarHtml = `<div class="chat-avatar bot-avatar"><div class="athena-icon"></div></div>`;
            }

            // --- MODIFICATION START: Use the temporary wrapper if it exists ---
            if (messageId && messageId.startsWith('optimistic-')) {
                messageWrapper.id = messageId;
            }
            // --- MODIFICATION END ---

            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${role}`;

            // Remove the thinking indicator if it exists, since we are now appending a new message.
            const thinkingIndicator = document.getElementById('thinking-indicator');
            if (thinkingIndicator) {
                thinkingIndicator.remove();
            }

            let messageContentHtml = marked.parse(content);

            // --- MODIFICATION START: Handle file previews from both backend (history) and frontend (live upload) ---
            if (fileData) {
                let fileUrl = fileData.url; // URL from backend for historical messages
                let fileType = fileData.type;

                // If no URL, it's likely a live upload. Create a blob URL from the file input.
                const fileInput = document.getElementById('chat-file-input');
                if (!fileUrl && fileInput && fileInput.files[0] && fileInput.files[0].name === fileData.name) {
                    const file = fileInput.files[0];
                    fileUrl = URL.createObjectURL(file);
                    fileType = file.type;
                }

                if (fileUrl) {
                    const filePreviewHtml = fileType.startsWith('image/')
                        ? `<img src="${fileUrl}" alt="${fileData.name}" class="chat-image-preview">`
                        : `<a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="chat-file-attachment-preview"><span class="file-icon">📄</span> <span class="file-name">${fileData.name}</span></a>`;
                    messageContentHtml += `<div class="chat-attachment-wrapper">${filePreviewHtml}</div>`;
                }
            }
            // --- MODIFICATION END ---

            if (messageId) messageEl.dataset.messageId = messageId;
            const copyButtonHtml = isError || role === 'user' ? '' : `<button class="chat-copy-btn" title="Copy response"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>`;
            messageEl.innerHTML = `<div class="message-content">${messageContentHtml}</div>${copyButtonHtml}`;
            messageWrapper.innerHTML = role === 'user' ? `${messageEl.outerHTML}${avatarHtml}` : `${avatarHtml}${messageEl.outerHTML}`;

            // --- MODIFICATION START: Handle temporary optimistic ID ---
            if (messageId && messageId.startsWith('optimistic-')) {
                messageWrapper.id = messageId;
            }
            chatMessages.appendChild(messageWrapper);
            // --- MODIFICATION END ---
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        document.querySelector('.chat-input-form-main').addEventListener('submit', (e) => {
            e.preventDefault();
            handleSend();
        });
        chatInput.addEventListener('keypress', (e) => {
            // Send on Enter, but allow new lines with Shift+Enter
            if (e.key === 'Enter' && !e.shiftKey) {
                handleSend();
            }
        });

        newChatBtn.addEventListener('click', createNewChat);
        loadChatHistory();
    }

    // Helper function for subjective answer toggling
    function addAnswerToggleLogic(container) {
        container.addEventListener('click', (e) => {
            if (e.target.matches('.toggle-answer-btn')) {
                const answerDiv = e.target.nextElementSibling;
                answerDiv.classList.toggle('hidden');
                e.target.textContent = answerDiv.classList.contains('hidden') ? 'Show Answer' : 'Hide Answer';
            }

            // Handle code copy button clicks
            if (e.target.matches('.copy-code-btn')) {
                const wrapper = e.target.closest('.code-block-wrapper');
                const preElement = wrapper.querySelector('pre');
                const codeText = preElement.innerText;

                navigator.clipboard.writeText(codeText).then(() => {
                    e.target.querySelector('.copy-text').textContent = 'Copied!';
                    setTimeout(() => {
                        e.target.querySelector('.copy-text').textContent = 'Copy';
                    }, 2000);
                });
            }
        });
    }

    // Helper function to apply staggered animations to a list of elements
    function animateInElements(elements) {
        elements.forEach((el, index) => {
            // Reset animation
            el.style.animation = 'none';
            el.offsetHeight; /* trigger reflow */
            el.style.animation = '';

            el.style.animation = `slideUpFadeIn 0.5s ease-out ${index * 0.07}s forwards`;
        });
    }
});