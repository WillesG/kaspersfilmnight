/* ========================================
   KASPER'S FILM NIGHT -- Archief Script
   ======================================== */

var PANTRY_ID = "60eda3f0-b164-4072-bf6b-b824a2bc5c91";
var PANTRY_URL = "https://getpantry.cloud/apiv1/pantry/" + PANTRY_ID + "/basket/";
var BASKET_NAME = "archive_data";

var isRating = false;
var isCommenting = false;
var userId = getOrCreateUserId();

document.addEventListener("DOMContentLoaded", function() {
    console.log("Archief loaded, userId:", userId);
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

function extractArchiveData(data) {
    console.log("Raw archive data:", data);
    
    var result = { ratings: {}, comments: {} };
    
    if (!data || typeof data !== "object") {
        console.log("Invalid data");
        return result;
    }
    
    if (data.ratings && typeof data.ratings === "object") {
        result.ratings = data.ratings;
    }
    
    if (data.comments && typeof data.comments === "object") {
        result.comments = data.comments;
    }
    
    console.log("Extracted archive data:", result);
    return result;
}

function loadArchive() {
    var container = document.getElementById("archiveGrid");
    
    if (!container) {
        console.log("No archiveGrid container found");
        return;
    }
    
    var movies = [];
    if (typeof ARCHIVE_MOVIES !== "undefined") {
        movies = ARCHIVE_MOVIES;
    }
    
    console.log("Archive movies:", movies);
    
    if (movies.length === 0) {
        container.innerHTML = "<div style=\"text-align: center; padding: 3rem; color: #888;\">Nog geen films gekeken! Het archief is nog leeg.</div>";
        return;
    }
    
    container.innerHTML = "<div style=\"text-align: center; padding: 3rem; color: #FFD166;\">🎬 Archief laden...</div>";
    
    fetch(PANTRY_URL + BASKET_NAME)
        .then(function(response) {
            console.log("Archive fetch status:", response.status);
            if (!response.ok) {
                throw new Error("Fetch failed: " + response.status);
            }
            return response.text();
        })
        .then(function(text) {
            console.log("Raw archive response:", text);
            var data = JSON.parse(text);
            var archiveData = extractArchiveData(data);
            renderArchive(container, movies, archiveData.ratings, archiveData.comments);
        })
        .catch(function(error) {
            console.error("Load archive error:", error);
            renderArchive(container, movies, {}, {});
        });
}

function renderArchive(container, movies, ratings, comments) {
    console.log("Rendering archive with ratings:", ratings, "comments:", comments);
    
    var html = "";
    
    for (var i = 0; i < movies.length; i++) {
        var movie = movies[i];
        var movieRatings = ratings[movie.id] || [];
        var movieComments = comments[movie.id] || [];
        
        if (!Array.isArray(movieRatings)) {
            movieRatings = [];
        }
        if (!Array.isArray(movieComments)) {
            movieComments = [];
        }
        
        console.log("Movie:", movie.id, "ratings:", movieRatings, "comments:", movieComments);
        
        var avgRating = 0;
        var totalRatings = 0;
        if (movieRatings.length > 0) {
            var sum = 0;
            for (var r = 0; r < movieRatings.length; r++) {
                if (movieRatings[r] && typeof movieRatings[r].rating === "number") {
                    sum += movieRatings[r].rating;
                    totalRatings++;
                }
            }
            if (totalRatings > 0) {
                avgRating = sum / totalRatings;
            }
        }
        
        var userRating = getUserRatingForMovie(movieRatings, userId);
        console.log("Movie:", movie.id, "avgRating:", avgRating, "userRating:", userRating, "totalRatings:", totalRatings);
        
        var posterHtml = "";
        if (movie.poster) {
            posterHtml = "<img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\">";
        } else {
            posterHtml = "<div class=\"poster-placeholder\">🎬</div>";
        }
        
        var starsHtml = "<div class=\"stars-container\">";
        for (var s = 1; s <= 5; s++) {
            var starClass = "star";
            if (s <= Math.round(avgRating)) {
                starClass += " active";
            }
            if (s <= userRating) {
                starClass += " user-voted";
            }
            starsHtml += "<span class=\"" + starClass + "\" data-rating=\"" + s + "\" data-movie=\"" + escapeHtml(movie.id) + "\" onclick=\"setRating('" + escapeHtml(movie.id) + "', " + s + ")\">★</span>";
        }
        starsHtml += "</div>";
        
        var ratingText = "";
        if (totalRatings > 0) {
            ratingText = avgRating.toFixed(1) + "/5 (" + totalRatings + " " + (totalRatings === 1 ? "stem" : "stemmen") + ")";
        } else {
            ratingText = "Nog niet beoordeeld";
        }
        
        if (userRating > 0) {
            ratingText += " - Jouw stem: " + userRating + "★";
        }
        
        var commentsListHtml = "";
        if (movieComments.length === 0) {
            commentsListHtml = "<p class=\"no-comments-text\">Nog geen reacties!</p>";
        } else {
            for (var c = 0; c < movieComments.length; c++) {
                var comm = movieComments[c];
                if (comm && comm.name) {
                    commentsListHtml += "<div class=\"archive-comment\">" +
                        "<span class=\"comment-author\">" + escapeHtml(comm.name) + "</span>" +
                        "<span class=\"comment-text\">" + escapeHtml(comm.text || "") + "</span>" +
                        "</div>";
                }
            }
        }
        
        html += "<div class=\"archive-card\" data-id=\"" + escapeHtml(movie.id) + "\">" +
            "<div class=\"archive-poster\">" + posterHtml + "</div>" +
            "<div class=\"archive-content\">" +
                "<div class=\"archive-header\">" +
                    "<h3 class=\"archive-title\">" + escapeHtml(movie.title) + "</h3>" +
                    "<p class=\"archive-meta\">" + escapeHtml(movie.year || "") + " - Gekeken: " + escapeHtml(movie.watchedDate || "") + "</p>" +
                "</div>" +
                "<div class=\"archive-rating\">" +
                    starsHtml +
                    "<span class=\"rating-text\">" + ratingText + "</span>" +
                "</div>" +
                "<div class=\"archive-comments\">" +
                    "<h4>💬 Reacties (" + movieComments.length + ")</h4>" +
                    "<div class=\"archive-comment-form\">" +
                        "<input type=\"text\" id=\"name-" + escapeHtml(movie.id) + "\" placeholder=\"Je naam\" maxlength=\"30\">" +
                        "<textarea id=\"comment-" + escapeHtml(movie.id) + "\" placeholder=\"Wat vond je van de film?\" maxlength=\"200\" rows=\"2\"></textarea>" +
                        "<button onclick=\"addComment('" + escapeHtml(movie.id) + "')\">Verstuur</button>" +
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

function getUserRatingForMovie(movieRatings, oderId) {
    for (var i = 0; i < movieRatings.length; i++) {
        if (movieRatings[i] && movieRatings[i].oderId === oderId) {
            return movieRatings[i].rating;
        }
    }
    return 0;
}

function setRating(movieId, rating) {
    if (isRating) {
        console.log("Already rating, skipping");
        return;
    }
    isRating = true;
    
    console.log("Setting rating for", movieId, "to", rating, "by user", userId);
    
    var stars = document.querySelectorAll(".star[data-movie=\"" + movieId + "\"]");
    for (var i = 0; i < stars.length; i++) {
        stars[i].style.opacity = "0.5";
        stars[i].style.pointerEvents = "none";
    }
    
    fetch(PANTRY_URL + BASKET_NAME)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Fetch failed: " + response.status);
            }
            return response.text();
        })
        .then(function(text) {
            console.log("Rating - raw response:", text);
            var data = JSON.parse(text);
            var archiveData = extractArchiveData(data);
            var ratings = archiveData.ratings;
            var comments = archiveData.comments;
            
            if (!ratings[movieId] || !Array.isArray(ratings[movieId])) {
                ratings[movieId] = [];
            }
            
            var found = false;
            for (var i = 0; i < ratings[movieId].length; i++) {
                if (ratings[movieId][i] && ratings[movieId][i].oderId === userId) {
                    if (ratings[movieId][i].rating === rating) {
                        ratings[movieId].splice(i, 1);
                        console.log("Removed existing rating");
                    } else {
                        ratings[movieId][i].rating = rating;
                        console.log("Updated existing rating to", rating);
                    }
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                ratings[movieId].push({
                    oderId: userId,
                    rating: rating
                });
                console.log("Added new rating:", rating);
            }
            
            console.log("Saving ratings:", ratings);
            
            return fetch(PANTRY_URL + BASKET_NAME, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ratings: ratings, comments: comments })
            });
        })
        .then(function(response) {
            console.log("Save rating response:", response.status);
            if (!response.ok) {
                throw new Error("Save failed: " + response.status);
            }
            isRating = false;
            loadArchive();
        })
        .catch(function(error) {
            console.error("Rating error:", error);
            isRating = false;
            alert("Er ging iets mis bij het opslaan van je stem. Probeer opnieuw.");
            loadArchive();
        });
}

function addComment(movieId) {
    if (isCommenting) {
        console.log("Already commenting, skipping");
        return;
    }
    
    var nameInput = document.getElementById("name-" + movieId);
    var commentInput = document.getElementById("comment-" + movieId);
    
    if (!nameInput || !commentInput) {
        console.log("Input fields not found for", movieId);
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
    
    isCommenting = true;
    console.log("Adding comment for", movieId, "by", name);
    
    var btn = document.querySelector(".archive-card[data-id=\"" + movieId + "\"] .archive-comment-form button");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Verzenden...";
    }
    
    fetch(PANTRY_URL + BASKET_NAME)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Fetch failed: " + response.status);
            }
            return response.text();
        })
        .then(function(text) {
            console.log("Comment - raw response:", text);
            var data = JSON.parse(text);
            var archiveData = extractArchiveData(data);
            var ratings = archiveData.ratings;
            var comments = archiveData.comments;
            
            if (!comments[movieId] || !Array.isArray(comments[movieId])) {
                comments[movieId] = [];
            }
            
            comments[movieId].unshift({
                name: name,
                text: text,
                timestamp: Date.now()
            });
            
            if (comments[movieId].length > 50) {
                comments[movieId] = comments[movieId].slice(0, 50);
            }
            
            console.log("Saving comments:", comments);
            
            return fetch(PANTRY_URL + BASKET_NAME, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ratings: ratings, comments: comments })
            });
        })
        .then(function(response) {
            console.log("Save comment response:", response.status);
            if (!response.ok) {
                throw new Error("Save failed: " + response.status);
            }
            nameInput.value = "";
            commentInput.value = "";
            isCommenting = false;
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Verstuur";
            }
            loadArchive();
        })
        .catch(function(error) {
            console.error("Comment error:", error);
            isCommenting = false;
            if (btn) {
                btn.disabled = false;
                btn.textContent = "Verstuur";
            }
            alert("Er ging iets mis bij het versturen. Probeer opnieuw.");
        });
}

function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
}
