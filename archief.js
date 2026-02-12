/* ========================================
   KASPER'S FILM NIGHT -- Archief Script
   ======================================== */

var PANTRY_ID = "60eda3f0-b164-4072-bf6b-b824a2bc5c91";
var PANTRY_URL = "https://getpantry.cloud/apiv1/pantry/" + PANTRY_ID + "/basket/";
var BASKET_NAME = "archive_data";

document.addEventListener("DOMContentLoaded", function() {
    loadArchive();
});

function getOrCreateUserId() {
    var id = null;
    try {
        id = localStorage.getItem("kfn_user_id");
    } catch (e) {}
    
    if (!id) {
        id = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        try {
            localStorage.setItem("kfn_user_id", id);
        } catch (e) {}
    }
    return id;
}

var oderId = getOrCreateUserId();

function extractArchiveData(data) {
    var result = { ratings: {}, comments: {} };
    
    if (!data || typeof data !== "object") {
        return result;
    }
    if (data.key === "value") {
        return result;
    }
    if (data.ratings && typeof data.ratings === "object") {
        result.ratings = data.ratings;
    }
    if (data.comments && typeof data.comments === "object") {
        result.comments = data.comments;
    }
    return result;
}

function loadArchive() {
    var container = document.getElementById("archiveGrid");
    
    if (!container) {
        return;
    }
    
    var movies = [];
    if (typeof ARCHIVE_MOVIES !== "undefined") {
        movies = ARCHIVE_MOVIES;
    }
    
    if (movies.length === 0) {
        container.innerHTML = "<div style=\"text-align: center; padding: 3rem; color: #888;\">Nog geen films gekeken! Het archief is nog leeg.</div>";
        return;
    }
    
    container.innerHTML = "<div style=\"text-align: center; padding: 3rem; color: #FFD166;\">🎬 Archief laden...</div>";
    
    fetch(PANTRY_URL + BASKET_NAME, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Fetch failed");
        }
        return response.json();
    })
    .then(function(data) {
        var archiveData = extractArchiveData(data);
        renderArchive(container, movies, archiveData.ratings, archiveData.comments);
    })
    .catch(function(error) {
        renderArchive(container, movies, {}, {});
    });
}

function renderArchive(container, movies, ratings, comments) {
    var html = "";
    
    for (var i = 0; i < movies.length; i++) {
        var movie = movies[i];
        var movieRatings = ratings[movie.id] || [];
        var movieComments = comments[movie.id] || [];
        
        var avgRating = 0;
        if (movieRatings.length > 0) {
            var sum = 0;
            for (var r = 0; r < movieRatings.length; r++) {
                sum += movieRatings[r].rating;
            }
            avgRating = Math.round(sum / movieRatings.length);
        }
        
        var posterHtml = "";
        if (movie.poster) {
            posterHtml = "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\">";
        } else {
            posterHtml = "<div class=\"poster-placeholder\">🎬</div>";
        }
        
        var starsHtml = "";
        for (var s = 1; s <= 5; s++) {
            var activeClass = s <= avgRating ? " active" : "";
            starsHtml += "<span class=\"star" + activeClass + "\" data-rating=\"" + s + "\" onclick=\"setRating('" + escapeHtml(movie.id) + "', " + s + ")\" style=\"cursor: pointer;\">⭐</span>";
        }
        
        var ratingText = "";
        if (movieRatings.length > 0) {
            ratingText = avgRating + "/5 (" + movieRatings.length + " " + (movieRatings.length === 1 ? "stem" : "stemmen") + ")";
        } else {
            ratingText = "Nog niet beoordeeld";
        }
        
        var commentsListHtml = "";
        if (movieComments.length === 0) {
            commentsListHtml = "<p style=\"color: #888; font-size: 0.85rem; padding: 0.5rem;\">Nog geen reacties!</p>";
        } else {
            for (var c = 0; c < movieComments.length; c++) {
                var comm = movieComments[c];
                commentsListHtml += "<div class=\"archive-comment\"><strong>" + escapeHtml(comm.name || "Anoniem") + ":</strong> " + escapeHtml(comm.text || "") + "</div>";
            }
        }
        
        html += "<div class=\"archive-card\" data-id=\"" + escapeHtml(movie.id) + "\">" +
            "<div class=\"archive-poster\">" + posterHtml + "</div>" +
            "<div class=\"archive-content\">" +
                "<div class=\"archive-header\">" +
                    "<h3 class=\"archive-title\">" + escapeHtml(movie.title) + "</h3>" +
                    "<p class=\"archive-meta\">" + escapeHtml(movie.year || "") + " - Gekeken: " + escapeHtml(movie.watchedDate || "") + "</p>" +
                "</div>" +
                "<div class=\"archive-rating\" data-movie=\"" + escapeHtml(movie.id) + "\">" +
                    starsHtml +
                    "<span class=\"rating-text\">" + ratingText + "</span>" +
                "</div>" +
                "<div class=\"archive-comments\">" +
                    "<h4>Reacties (" + movieComments.length + ")</h4>" +
                    "<div class=\"archive-comment-form\">" +
                        "<input type=\"text\" id=\"name-" + escapeHtml(movie.id) + "\" placeholder=\"Je naam\" maxlength=\"20\">" +
                        "<input type=\"text\" id=\"comment-" + escapeHtml(movie.id) + "\" placeholder=\"Wat vond je ervan?\" maxlength=\"150\">" +
                        "<button onclick=\"addComment('" + escapeHtml(movie.id) + "')\">Post</button>" +
                    "</div>" +
                    "<div class=\"archive-comments-list\" id=\"comments-" + escapeHtml(movie.id) + "\">" +
                        commentsListHtml +
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>";
    }
    
    container.innerHTML = html;
}

function getUserRatingLocal(movieId) {
    try {
        var stored = localStorage.getItem("kfn_user_ratings");
        if (stored) {
            var ratings = JSON.parse(stored);
            return ratings[movieId] || 0;
        }
    } catch (e) {}
    return 0;
}

function saveUserRatingLocal(movieId, rating) {
    try {
        var stored = localStorage.getItem("kfn_user_ratings");
        var ratings = stored ? JSON.parse(stored) : {};
        ratings[movieId] = rating;
        localStorage.setItem("kfn_user_ratings", JSON.stringify(ratings));
    } catch (e) {}
}

function setRating(movieId, rating) {
    var oldRating = getUserRatingLocal(movieId);
    
    if (oldRating === rating) {
        rating = 0;
    }
    
    saveUserRatingLocal(movieId, rating);
    
    fetch(PANTRY_URL + BASKET_NAME, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Fetch failed");
        }
        return response.json();
    })
    .then(function(data) {
        var archiveData = extractArchiveData(data);
        var ratings = archiveData.ratings;
        var comments = archiveData.comments;
        
        if (!ratings[movieId]) {
            ratings[movieId] = [];
        }
        
        var found = false;
        for (var i = 0; i < ratings[movieId].length; i++) {
            if (ratings[movieId][i].oderId === oderId) {
                if (rating === 0) {
                    ratings[movieId].splice(i, 1);
                } else {
                    ratings[movieId][i].rating = rating;
                }
                found = true;
                break;
            }
        }
        
        if (!found && rating > 0) {
            ratings[movieId].push({
                oderId: oderId,
                rating: rating
            });
        }
        
        return fetch(PANTRY_URL + BASKET_NAME, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ratings: ratings, comments: comments })
        });
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Save failed");
        }
        loadArchive();
    })
    .catch(function(error) {
        loadArchive();
    });
}

function addComment(movieId) {
    var nameInput = document.getElementById("name-" + movieId);
    var commentInput = document.getElementById("comment-" + movieId);
    
    if (!nameInput || !commentInput) {
        return;
    }
    
    var name = nameInput.value.trim();
    var text = commentInput.value.trim();
    
    if (!name) {
        alert("Vul je naam in!");
        nameInput.focus();
        return;
    }
    
    if (!text) {
        alert("Schrijf een reactie!");
        commentInput.focus();
        return;
    }
    
    var btn = commentInput.nextElementSibling;
    if (btn) {
        btn.disabled = true;
        btn.textContent = "...";
    }
    
    fetch(PANTRY_URL + BASKET_NAME, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Fetch failed");
        }
        return response.json();
    })
    .then(function(data) {
        var archiveData = extractArchiveData(data);
        var ratings = archiveData.ratings;
        var comments = archiveData.comments;
        
        if (!comments[movieId]) {
            comments[movieId] = [];
        }
        
        comments[movieId].unshift({
            name: name,
            text: text,
            timestamp: Date.now()
        });
        
        if (comments[movieId].length > 30) {
            comments[movieId] = comments[movieId].slice(0, 30);
        }
        
        return fetch(PANTRY_URL + BASKET_NAME, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ratings: ratings, comments: comments })
        });
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Save failed");
        }
        nameInput.value = "";
        commentInput.value = "";
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Post";
        }
        loadArchive();
    })
    .catch(function(error) {
        alert("Er ging iets mis. Probeer opnieuw.");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Post";
        }
    });
}

function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}
