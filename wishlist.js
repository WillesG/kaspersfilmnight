/* ========================================
   KASPER'S FILM NIGHT -- Verlanglijst Script
   ======================================== */

var PANTRY_ID = "60eda3f0-b164-4072-bf6b-b824a2bc5c91";
var PANTRY_URL = "https://getpantry.cloud/apiv1/pantry/" + PANTRY_ID + "/basket/";
var BASKET_NAME = "wishlist_votes";

var LOCAL_VOTES_KEY = "kfn_user_votes";
var isAdminMode = false;

document.addEventListener("DOMContentLoaded", function() {
    loadWishlist();
    setupAdminPanel();
});

function getUserVotesLocal() {
    try {
        var stored = localStorage.getItem(LOCAL_VOTES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {}
    return [];
}

function saveUserVotesLocal(votes) {
    try {
        localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votes));
    } catch (e) {}
}

function loadWishlist() {
    var container = document.getElementById("wishlistGrid");
    
    if (!container) {
        return;
    }
    
    container.innerHTML = "<div style=\"grid-column: 1/-1; text-align: center; padding: 3rem; color: #FFD166;\">🍿 Stemmen laden...</div>";
    
    fetch(PANTRY_URL + BASKET_NAME, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var votes = data.votes || {};
        renderWishlist(container, votes);
    })
    .catch(function(error) {
        renderWishlist(container, {});
    });
}

function renderWishlist(container, votes) {
    var defaultMovies = [];
    if (typeof WISHLIST_MOVIES !== "undefined") {
        defaultMovies = WISHLIST_MOVIES;
    }
    
    var customMovies = [];
    try {
        var stored = localStorage.getItem("kfn_custom_wishlist");
        if (stored) {
            customMovies = JSON.parse(stored);
        }
    } catch (e) {}
    
    var allMovies = defaultMovies.concat(customMovies);
    
    if (allMovies.length === 0) {
        container.innerHTML = "<div style=\"grid-column: 1/-1; text-align: center; padding: 3rem; color: #888;\">Nog geen films op de verlanglijst!</div>";
        return;
    }
    
    var userVotes = getUserVotesLocal();
    
    allMovies.sort(function(a, b) {
        return (votes[b.id] || 0) - (votes[a.id] || 0);
    });
    
    var html = "";
    for (var i = 0; i < allMovies.length; i++) {
        var movie = allMovies[i];
        var voteCount = votes[movie.id] || 0;
        var hasVoted = userVotes.indexOf(movie.id) !== -1;
        var isCustom = false;
        for (var j = 0; j < customMovies.length; j++) {
            if (customMovies[j].id === movie.id) {
                isCustom = true;
                break;
            }
        }
        
        var deleteBtn = "";
        if (isAdminMode && isCustom) {
            deleteBtn = "<button class=\"btn-delete\" onclick=\"deleteMovie('" + escapeHtml(movie.id) + "')\" title=\"Verwijderen\">X</button>";
        }
        
        var posterHtml = "";
        if (movie.poster) {
            posterHtml = "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\">";
        } else {
            posterHtml = "<div class=\"poster-placeholder\">🎬</div>";
        }
        
        var votedClass = hasVoted ? " voted" : "";
        var voteText = voteCount === 1 ? "stem" : "stemmen";
        
        html += "<div class=\"wishlist-card\" data-id=\"" + escapeHtml(movie.id) + "\">" +
            deleteBtn +
            "<div class=\"wishlist-poster\">" + posterHtml + "</div>" +
            "<div class=\"wishlist-info\">" +
                "<h3 class=\"wishlist-title\">" + escapeHtml(movie.title) + "</h3>" +
                "<p class=\"wishlist-year\">" + escapeHtml(movie.year || "") + "</p>" +
                "<div class=\"vote-section\">" +
                    "<button class=\"vote-btn" + votedClass + "\" onclick=\"toggleVote('" + escapeHtml(movie.id) + "')\" title=\"" + (hasVoted ? "Stem verwijderen" : "Stem op deze film!") + "\">🍿</button>" +
                    "<span class=\"vote-count\" id=\"count-" + escapeHtml(movie.id) + "\">" + voteCount + " " + voteText + "</span>" +
                "</div>" +
            "</div>" +
        "</div>";
    }
    
    container.innerHTML = html;
}

function toggleVote(movieId) {
    var userVotes = getUserVotesLocal();
    var hasVoted = userVotes.indexOf(movieId) !== -1;
    
    var btn = document.querySelector(".wishlist-card[data-id=\"" + movieId + "\"] .vote-btn");
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    }
    
    fetch(PANTRY_URL + BASKET_NAME, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var votes = data.votes || {};
        
        if (hasVoted) {
            votes[movieId] = Math.max(0, (votes[movieId] || 1) - 1);
            var index = userVotes.indexOf(movieId);
            if (index !== -1) {
                userVotes.splice(index, 1);
            }
        } else {
            votes[movieId] = (votes[movieId] || 0) + 1;
            userVotes.push(movieId);
        }
        
        saveUserVotesLocal(userVotes);
        
        return fetch(PANTRY_URL + BASKET_NAME, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ votes: votes })
        });
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Save failed");
        }
        loadWishlist();
    })
    .catch(function(error) {
        alert("Er ging iets mis. Probeer opnieuw.");
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = "1";
        }
    });
}

function setupAdminPanel() {
    var addBtn = document.getElementById("addMovie");
    
    if (!addBtn) {
        return;
    }
    
    addBtn.onclick = function() {
        var titleInput = document.getElementById("newMovieTitle");
        var yearInput = document.getElementById("newMovieYear");
        var posterInput = document.getElementById("newMoviePoster");
        
        var title = titleInput ? titleInput.value.trim() : "";
        var year = yearInput ? yearInput.value.trim() : "";
        var poster = posterInput ? posterInput.value.trim() : "";
        
        if (!title) {
            alert("Vul een filmtitel in!");
            if (titleInput) titleInput.focus();
            return;
        }
        
        var customMovies = [];
        try {
            var stored = localStorage.getItem("kfn_custom_wishlist");
            if (stored) {
                customMovies = JSON.parse(stored);
            }
        } catch (e) {
            customMovies = [];
        }
        
        customMovies.push({
            id: "custom_" + Date.now(),
            title: title,
            year: year || "????",
            poster: poster
        });
        
        try {
            localStorage.setItem("kfn_custom_wishlist", JSON.stringify(customMovies));
        } catch (e) {
            alert("Er ging iets mis.");
            return;
        }
        
        if (titleInput) titleInput.value = "";
        if (yearInput) yearInput.value = "";
        if (posterInput) posterInput.value = "";
        
        loadWishlist();
    };
}

function deleteMovie(movieId) {
    if (!confirm("Weet je zeker dat je deze film wilt verwijderen?")) {
        return;
    }
    
    var customMovies = [];
    try {
        var stored = localStorage.getItem("kfn_custom_wishlist");
        if (stored) {
            customMovies = JSON.parse(stored);
        }
    } catch (e) {
        customMovies = [];
    }
    
    var newList = [];
    for (var i = 0; i < customMovies.length; i++) {
        if (customMovies[i].id !== movieId) {
            newList.push(customMovies[i]);
        }
    }
    
    localStorage.setItem("kfn_custom_wishlist", JSON.stringify(newList));
    loadWishlist();
}

function enableAdmin(password) {
    var correctPassword = "popcorn";
    if (typeof ADMIN_PASSWORD !== "undefined") {
        correctPassword = ADMIN_PASSWORD;
    }
    
    if (password === correctPassword) {
        isAdminMode = true;
        var panel = document.getElementById("adminPanel");
        if (panel) {
            panel.classList.remove("hidden");
        }
        loadWishlist();
        return "Admin modus AAN!";
    } else {
        return "Verkeerd wachtwoord!";
    }
}

function disableAdmin() {
    isAdminMode = false;
    var panel = document.getElementById("adminPanel");
    if (panel) {
        panel.classList.add("hidden");
    }
    loadWishlist();
    return "Admin modus UIT.";
}

function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}
