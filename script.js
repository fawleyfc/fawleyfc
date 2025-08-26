// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) { // Check if elements exist (they won't on admin.html)
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) { // Check if navbar exists
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// --- Content Management ---

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not fetch data from ${url}:`, error);
        return null;
    }
}

// Populate Team Page
async function populateTeam(teamName = 'teamA') { // Default to Team A
    const teamGrid = document.getElementById('current-team-grid');
    if (!teamGrid) return;

    const teamData = await fetchData('team.json');
    if (!teamData || !teamData[teamName]) {
        teamGrid.innerHTML = '<p>Could not load team data.</p>';
        return;
    }

    const players = teamData[teamName];

    teamGrid.innerHTML = ''; // Clear existing hardcoded content
    if (players.length === 0) {
        teamGrid.innerHTML = `<p>No players currently listed for ${teamName === 'teamA' ? 'Team A' : 'Team B'}.</p>`;
        return;
    }

    players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <img src="${player.image || 'player_placeholder.png'}" alt="${player.name}" class="player-photo">
            <h3 class="player-name">${player.name}</h3>
            <p class="player-position">${player.position}</p>
        `;
        teamGrid.appendChild(playerCard);
    });
}

// Populate News Page
async function populateNews() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    const articles = await fetchData('news.json');
    if (!articles) {
        newsGrid.innerHTML = '<p>Could not load news articles.</p>';
        return;
    }

    newsGrid.innerHTML = ''; // Clear existing hardcoded content
    articles.forEach(article => {
        const articleCard = document.createElement('article');
        articleCard.className = 'news-card';
        articleCard.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="news-image">
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.excerpt}</p>
                <a href="${article.link}" class="btn btn-primary">Read More</a>
            </div>
        `;
        newsGrid.appendChild(articleCard);
    });
}

// Populate Fixtures Page
async function populateFixtures() {
    const upcomingContainer = document.getElementById('upcoming-matches');
    const resultsContainer = document.getElementById('past-results');
    if (!upcomingContainer || !resultsContainer) return;

    const fixtures = await fetchData('fixtures.json');
    if (!fixtures) {
        upcomingContainer.innerHTML = '<p>Could not load fixtures.</p>';
        return;
    }

    // Populate Upcoming Matches
    upcomingContainer.innerHTML = '';
    if (fixtures.upcoming && fixtures.upcoming.length > 0) {
        fixtures.upcoming.forEach(match => {
            const fixtureItem = document.createElement('div');
            fixtureItem.className = 'fixture-item';
            fixtureItem.innerHTML = `
                <span class="fixture-date">${match.date}</span>
                <div class="fixture-teams">
                    <span>${match.home_team}</span> <span class="vs">vs</span> <span>${match.away_team}</span>
                </div>
                <span class="fixture-time">${match.time}</span>
                <span class="fixture-venue">${match.venue}</span>
            `;
            upcomingContainer.appendChild(fixtureItem);
        });
    } else {
        upcomingContainer.innerHTML = '<p>No upcoming matches scheduled.</p>';
    }

    // Populate Past Results
    resultsContainer.innerHTML = '';
    if (fixtures.results && fixtures.results.length > 0) {
        fixtures.results.forEach(match => {
            const fixtureItem = document.createElement('div');
            fixtureItem.className = 'fixture-item result';
            fixtureItem.innerHTML = `
                <span class="fixture-date">${match.date}</span>
                <div class="fixture-teams">
                    <span>${match.home_team}</span> <span class="score ${match.result}">${match.score}</span> <span>${match.away_team}</span>
                </div>
                <span class="fixture-time">Finished</span>
                <span class="fixture-venue">${match.venue}</span>
            `;
            resultsContainer.appendChild(fixtureItem);
        });
    } else {
        resultsContainer.innerHTML = '<p>No past results available.</p>';
    }
}

// --- Admin Page Logic ---

async function renderAdminSection(type, data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    if (!data || data.length === 0) {
        container.innerHTML = '<p>No items found. Click "Add New" to start.</p>';
        return;
    }

    data.forEach((item, index) => {
        let itemCard = document.createElement('div');
        itemCard.className = 'admin-item-card';
        itemCard.dataset.index = index; // Store index for deletion/retrieval
        itemCard.dataset.dataType = type; // Store the specific type (teamA, teamB)

        if (type === 'teamA' || type === 'teamB') {
            itemCard.innerHTML = `
                <label for="${type}-name-${index}">Name:</label>
                <input type="text" id="${type}-name-${index}" class="team-name-input" value="${item.name || ''}">
                
                <label for="${type}-position-${index}">Position:</label>
                <input type="text" id="${type}-position-${index}" class="team-position-input" value="${item.position || ''}">
                
                <label for="${type}-image-${index}">Image URL/Filename:</label>
                <input type="text" id="${type}-image-${index}" class="team-image-input" value="${item.image || 'player_placeholder.png'}">
                <p style="font-size:0.8em; color:#777; margin-bottom:1em;">(e.g., player_placeholder.png or https://example.com/image.jpg)</p>
                <div class="item-actions">
                    <button class="btn delete-btn" data-type="${type}" data-index="${index}">Delete</button>
                </div>
            `;
        } else if (type === 'news') {
            itemCard.innerHTML = `
                <label for="news-title-${index}">Title:</label>
                <input type="text" id="news-title-${index}" class="news-title-input" value="${item.title || ''}">
                
                <label for="news-image-${index}">Image URL:</label>
                <input type="url" id="news-image-${index}" class="news-image-input" value="${item.image || ''}">
                
                <label for="news-excerpt-${index}">Excerpt:</label>
                <textarea id="news-excerpt-${index}" class="news-excerpt-input" rows="3">${item.excerpt || ''}</textarea>
                
                <label for="news-link-${index}">Link (URL):</label>
                <input type="url" id="news-link-${index}" class="news-link-input" value="${item.link || '#'}">
                <div class="item-actions">
                    <button class="btn delete-btn" data-type="news" data-index="${index}">Delete</button>
                </div>
            `;
        } else if (type === 'upcoming') {
            itemCard.innerHTML = `
                <label for="fixture-date-${index}">Date (e.g., 25 DEC 2024):</label>
                <input type="text" id="fixture-date-${index}" class="fixture-date-input" value="${item.date || ''}">
                
                <label for="fixture-home-${index}">Home Team:</label>
                <input type="text" id="fixture-home-${index}" class="fixture-home-input" value="${item.home_team || ''}">
                
                <label for="fixture-away-${index}">Away Team:</label>
                <input type="text" id="fixture-away-${index}" class="fixture-away-input" value="${item.away_team || ''}">
                
                <label for="fixture-time-${index}">Time (e.g., 15:00):</label>
                <input type="text" id="fixture-time-${index}" class="fixture-time-input" value="${item.time || ''}">
                
                <label for="fixture-venue-${index}">Venue:</label>
                <input type="text" id="fixture-venue-${index}" class="fixture-venue-input" value="${item.venue || ''}">
                <div class="item-actions">
                    <button class="btn delete-btn" data-type="upcoming" data-index="${index}">Delete</button>
                </div>
            `;
        } else if (type === 'result') {
            itemCard.innerHTML = `
                <label for="result-date-${index}">Date (e.g., 18 DEC 2024):</label>
                <input type="text" id="result-date-${index}" class="result-date-input" value="${item.date || ''}">
                
                <label for="result-home-${index}">Home Team:</label>
                <input type="text" id="result-home-${index}" class="result-home-input" value="${item.home_team || ''}">
                
                <label for="result-away-${index}">Away Team:</label>
                <input type="text" id="result-away-${index}" class="result-away-input" value="${item.away_team || ''}">
                
                <label for="result-score-${index}">Score (e.g., 3 - 1):</label>
                <input type="text" id="result-score-${index}" class="result-score-input" value="${item.score || ''}">
                
                <label for="result-type-${index}">Result:</label>
                <select id="result-type-${index}" class="result-type-select">
                    <option value="win" ${item.result === 'win' ? 'selected' : ''}>Win</option>
                    <option value="loss" ${item.result === 'loss' ? 'selected' : ''}>Loss</option>
                    <option value="draw" ${item.result === 'draw' ? 'selected' : ''}>Draw</option>
                </select>
                
                <label for="result-venue-${index}">Venue:</label>
                <input type="text" id="result-venue-${index}" class="result-venue-input" value="${item.venue || ''}">
                <div class="item-actions">
                    <button class="btn delete-btn" data-type="result" data-index="${index}">Delete</button>
                </div>
            `;
        }
        container.appendChild(itemCard);
    });
}

function addNewItemToAdmin(type) {
    let container;
    let newCardHTML = '';
    let newIndex = 0; // Will be updated to actual last index + 1

    if (type === 'teamA' || type === 'teamB') {
        container = document.getElementById(`${type}-items-container`);
        const existingItems = container.querySelectorAll('.admin-item-card');
        newIndex = existingItems.length;
        newCardHTML = `
            <label for="${type}-name-${newIndex}">Name:</label>
            <input type="text" id="${type}-name-${newIndex}" class="team-name-input" value="">
            
            <label for="${type}-position-${newIndex}">Position:</label>
            <input type="text" id="${type}-position-${newIndex}" class="team-position-input" value="">
            
            <label for="${type}-image-${newIndex}">Image URL/Filename:</label>
            <input type="text" id="${type}-image-${newIndex}" class="team-image-input" value="player_placeholder.png">
            <p style="font-size:0.8em; color:#777; margin-bottom:1em;">(e.g., player_placeholder.png or https://example.com/image.jpg)</p>
            <div class="item-actions">
                <button class="btn delete-btn" data-type="${type}" data-index="${newIndex}">Delete</button>
            </div>
        `;
    } else if (type === 'news') {
        container = document.getElementById('news-items-container');
        const existingItems = container.querySelectorAll('.admin-item-card');
        newIndex = existingItems.length;
        newCardHTML = `
            <label for="news-title-${newIndex}">Title:</label>
            <input type="text" id="news-title-${newIndex}" class="news-title-input" value="">
            
            <label for="news-image-${newIndex}">Image URL:</label>
            <input type="url" id="news-image-${newIndex}" class="news-image-input" value="">
            
            <label for="news-excerpt-${newIndex}">Excerpt:</label>
            <textarea id="news-excerpt-${newIndex}" class="news-excerpt-input" rows="3"></textarea>
            
            <label for="news-link-${newIndex}">Link (URL):</label>
            <input type="url" id="news-link-${newIndex}" class="news-link-input" value="#">
            <div class="item-actions">
                <button class="btn delete-btn" data-type="news" data-index="${newIndex}">Delete</button>
            </div>
        `;
    } else if (type === 'upcoming') {
        container = document.getElementById('upcoming-items-container');
        const existingItems = container.querySelectorAll('.admin-item-card');
        newIndex = existingItems.length;
        newCardHTML = `
            <label for="fixture-date-${newIndex}">Date (e.g., 25 DEC 2024):</label>
            <input type="text" id="fixture-date-${newIndex}" class="fixture-date-input" value="">
            
            <label for="fixture-home-${newIndex}">Home Team:</label>
            <input type="text" id="fixture-home-${newIndex}" class="fixture-home-input" value="">
            
            <label for="fixture-away-${newIndex}">Away Team:</label>
            <input type="text" id="fixture-away-${newIndex}" class="fixture-away-input" value="">
            
            <label for="fixture-time-${newIndex}">Time (e.g., 15:00):</label>
            <input type="text" id="fixture-time-${newIndex}" class="fixture-time-input" value="">
            
            <label for="fixture-venue-${newIndex}">Venue:</label>
            <input type="text" id="fixture-venue-${newIndex}" class="fixture-venue-input" value="">
            <div class="item-actions">
                <button class="btn delete-btn" data-type="upcoming" data-index="${newIndex}">Delete</button>
            </div>
        `;
    } else if (type === 'result') {
        container = document.getElementById('results-items-container');
        const existingItems = container.querySelectorAll('.admin-item-card');
        newIndex = existingItems.length;
        newCardHTML = `
            <label for="result-date-${newIndex}">Date (e.g., 18 DEC 2024):</label>
            <input type="text" id="result-date-${newIndex}" class="result-date-input" value="">
            
            <label for="result-home-${newIndex}">Home Team:</label>
            <input type="text" id="result-home-${newIndex}" class="result-home-input" value="">
            
            <label for="result-away-${newIndex}">Away Team:</label>
            <input type="text" id="result-away-${newIndex}" class="result-away-input" value="">
            
            <label for="result-score-${newIndex}">Score (e.g., 3 - 1):</label>
            <input type="text" id="result-score-${newIndex}" class="result-score-input" value="">
            
            <label for="result-type-${newIndex}">Result:</label>
            <select id="result-type-${newIndex}" class="result-type-select">
                <option value="win">Win</option>
                <option value="loss">Loss</option>
                <option value="draw">Draw</option>
            </select>
            
            <label for="result-venue-${newIndex}">Venue:</label>
            <input type="text" id="result-venue-${newIndex}" class="result-venue-input" value="">
            <div class="item-actions">
                <button class="btn delete-btn" data-type="result" data-index="${newIndex}">Delete</button>
            </div>
        `;
    }
    
    if (container && newCardHTML) {
        const newCard = document.createElement('div');
        newCard.className = 'admin-item-card new-item';
        newCard.dataset.index = newIndex; // Assign new index
        newCard.dataset.dataType = type; // Ensure data type is set for new cards
        newCard.innerHTML = newCardHTML;
        container.appendChild(newCard);

        // Re-attach delete listeners after adding new item
        setupAdminListeners(); 
    }
}

async function loadAdminData() {
    const teamData = await fetchData('team.json');
    if (teamData) {
        renderAdminSection('teamA', teamData.teamA || [], 'teamA-items-container');
        renderAdminSection('teamB', teamData.teamB || [], 'teamB-items-container');
    } else {
        document.getElementById('teamA-items-container').innerHTML = '<p>Error loading Team A data.</p>';
        document.getElementById('teamB-items-container').innerHTML = '<p>Error loading Team B data.</p>';
    }

    const newsData = await fetchData('news.json');
    if (newsData) {
        renderAdminSection('news', newsData, 'news-items-container');
    } else {
        document.getElementById('news-items-container').innerHTML = '<p>Error loading news data.</p>';
    }

    const fixturesData = await fetchData('fixtures.json');
    if (fixturesData) {
        renderAdminSection('upcoming', fixturesData.upcoming, 'upcoming-items-container');
        renderAdminSection('result', fixturesData.results, 'results-items-container');
    } else {
        document.getElementById('upcoming-items-container').innerHTML = '<p>Error loading fixtures data.</p>';
        document.getElementById('results-items-container').innerHTML = ''; // Clear results if main data fails
    }
}

function collectAndOutputData(dataType) {
    let collectedData = null;
    let outputId = '';
    let outputContainerId = '';
    let filename = '';

    if (dataType === 'team') {
        const teamAPlayerCards = document.querySelectorAll('#teamA-items-container .admin-item-card');
        const teamAData = Array.from(teamAPlayerCards).map(card => ({
            name: card.querySelector('.team-name-input').value,
            position: card.querySelector('.team-position-input').value,
            image: card.querySelector('.team-image-input').value
        }));

        const teamBPlayerCards = document.querySelectorAll('#teamB-items-container .admin-item-card');
        const teamBData = Array.from(teamBPlayerCards).map(card => ({
            name: card.querySelector('.team-name-input').value,
            position: card.querySelector('.team-position-input').value,
            image: card.querySelector('.team-image-input').value
        }));

        collectedData = {
            teamA: teamAData,
            teamB: teamBData
        };
        outputId = 'teamOutput';
        outputContainerId = 'teamOutputContainer';
        filename = 'team.json';
    } else if (dataType === 'news') {
        const articleCards = document.querySelectorAll('#news-items-container .admin-item-card');
        collectedData = Array.from(articleCards).map(card => ({
            title: card.querySelector('.news-title-input').value,
            image: card.querySelector('.news-image-input').value,
            excerpt: card.querySelector('.news-excerpt-input').value,
            link: card.querySelector('.news-link-input').value
        }));
        outputId = 'newsOutput';
        outputContainerId = 'newsOutputContainer';
        filename = 'news.json';
    } else if (dataType === 'fixtures') {
        const upcomingCards = document.querySelectorAll('#upcoming-items-container .admin-item-card');
        const resultsCards = document.querySelectorAll('#results-items-container .admin-item-card');

        const upcoming = Array.from(upcomingCards).map(card => ({
            date: card.querySelector('.fixture-date-input').value,
            home_team: card.querySelector('.fixture-home-input').value,
            away_team: card.querySelector('.fixture-away-input').value,
            time: card.querySelector('.fixture-time-input').value,
            venue: card.querySelector('.fixture-venue-input').value
        }));

        const results = Array.from(resultsCards).map(card => ({
            date: card.querySelector('.result-date-input').value,
            home_team: card.querySelector('.result-home-input').value,
            away_team: card.querySelector('.result-away-input').value,
            score: card.querySelector('.result-score-input').value,
            result: card.querySelector('.result-type-select').value,
            venue: card.querySelector('.result-venue-input').value
        }));

        collectedData = { upcoming, results };
        outputId = 'fixturesOutput';
        outputContainerId = 'fixturesOutputContainer';
        filename = 'fixtures.json';
    }

    const outputCodeElement = document.getElementById(outputId);
    const outputContainer = document.getElementById(outputContainerId);
    const copyBtn = outputContainer ? outputContainer.querySelector('.copy-btn') : null;
    const downloadBtn = outputContainer ? outputContainer.querySelector('.download-btn') : null;

    if (outputCodeElement && collectedData !== null) {
        const jsonString = JSON.stringify(collectedData, null, 2);
        outputCodeElement.textContent = jsonString;
        if (outputContainer) {
            outputContainer.style.display = 'block'; // Show container
            if (copyBtn) { // Reset copy button state
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.classList.remove('copied', 'error');
            }
            if (downloadBtn) { // Setup download button
                downloadBtn.onclick = () => downloadJson(filename, jsonString);
            }
        }
    } else {
        if (outputCodeElement) {
            outputCodeElement.textContent = 'Error: Could not collect data.';
            outputCodeElement.style.color = '#ef4444';
        }
        if (outputContainer) {
            outputContainer.style.display = 'block';
        }
    }
}

function downloadJson(filename, jsonString) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function setupAdminListeners() {
    // Add new item buttons
    document.querySelectorAll('.add-new-btn').forEach(button => {
        button.onclick = (e) => {
            const targetType = e.target.dataset.target;
            addNewItemToAdmin(targetType);
        };
    });

    // Save All Data buttons
    document.querySelectorAll('.save-all-data-btn').forEach(button => {
        button.onclick = (e) => {
            const targetType = e.target.dataset.target;
            collectAndOutputData(targetType);
        };
    });

    // Delete item buttons (delegated)
    document.querySelectorAll('.admin-item-grid').forEach(container => {
        container.onclick = (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const itemCard = e.target.closest('.admin-item-card');
                if (itemCard) {
                    itemCard.remove();
                    // Re-index cards if necessary, or just let the "save all" handle gaps
                    // For simplicity, we'll let "save all" reconstruct the array
                }
            }
        };
    });

    // Copy to Clipboard buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const target = button.dataset.target;
            const outputCode = document.getElementById(`${target}Output`);
            if (!outputCode) return;
            const textToCopy = outputCode.textContent;

            try {
                await navigator.clipboard.writeText(textToCopy);
                button.textContent = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = 'Copy to Clipboard';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                button.textContent = 'Failed to copy!';
                button.classList.add('error');
                setTimeout(() => {
                    button.textContent = 'Copy to Clipboard';
                    button.classList.remove('error');
                }, 2000);
            }
        });
    });
}

// Run population functions based on the current page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('admin-page')) {
        loadAdminData();
        setupAdminListeners(); // Attach event listeners after content is loaded
    } else {
        // Existing page specific population
        if (document.querySelector('.team-grid')) {
            populateTeam(); // Populate with default teamA
            // Add event listeners for team selection buttons
            document.querySelectorAll('.team-selector-btn').forEach(button => {
                button.addEventListener('click', function() {
                    document.querySelectorAll('.team-selector-btn').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    populateTeam(this.dataset.team);
                });
            });
        }
        if (document.querySelector('.news-grid')) {
            populateNews();
        }
        if (document.querySelector('.fixtures-list')) {
            populateFixtures();
        }
    }
});
