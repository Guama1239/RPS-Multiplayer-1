$(document).ready(function(){
    var config = {
      apiKey: "AIzaSyA7ta-TS3GcFmLzxhl1SwZuEVIqDbzmHfc",
      authDomain: "rps-qg.firebaseapp.com",
      databaseURL: "https://rps-qg.firebaseio.com",
      projectId: "rps-qg",
      storageBucket: "rps-qg.appspot.com",
      messagingSenderId: "946643017034"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    var playersRef = database.ref("playerData");
    var turnRef = database.ref("turn");
    var p1_exist = false;
    var p2_exist = false
    var userName;
    var userRole;
    var numPlayers = null;
    var currentTurn = null;
    var judge = function(){     
        if ((p1_choice === "Rock") && (p2_choice === "Scissors")) {
            uponP1win();
        } else if ((p1_choice=== "Rock") && (p2_choice === "Paper")) {
            uponP2win();
        } else if ((p1_choice === "Scissors") && (p2_choice === "Rock")) {
            uponP2win();
        } else if ((p1_choice === "Scissors") && (p2_choice === "Paper")) {
            uponP1win();
        } else if ((p1_choice === "Paper") && (p2_choice === "Rock")) {
            uponP1win();
        } else if ((p1_choice === "Paper") && (p2_choice === "Scissors")) {
            uponP2win();
        } else if (p1_choice === p2_choice) {
            $(".result").html("Tie<br>Game!")
        }            
    }
var p1_wins = null;
var p2_wins = null;
var p1_losses = null;
var p2_losses = null;
var p1_name = null;
var p2_name = null;
var uponP1win = function(){
    console.log("judged")
    p1_wins++;
    p2_losses++;
    database.ref("/playerData/1/wins").set(p1_wins);
    database.ref("/playerData/2/losses").set(p2_losses);
    $(".result").html(`${p1_name} <br> Wins!`);
}
var uponP2win = function(){
    console.log("judged")
    p2_wins++;
    p1_losses++;
    database.ref("/playerData/1/losses").set(p1_losses);
    database.ref("/playerData/2/wins").set(p2_wins);
    $(".result").html(`${p2_name} <br> Wins!`);
}
var p1_choice;
var p2_choice;
//track number of players and existance of p1 and p2
    playersRef.on("value",function(snap){
        if(snap.val()){
            numPlayers = snap.numChildren();
            p1_exist = snap.child("1").exists();
            p2_exist = snap.child("2").exists();
            if(p1_exist){
                let data = snap.child("1").val();
                $(".p1").find("h2").text(data.name);
                $(".p1").find(".wins").text("Wins: "+ data.wins);
                $(".p1").find(".losses").text("Losses: "+ data.losses);
                p1_choice = data.choice;
                p1_name = data.name
            } else{
                $(".p1").find("h2").text("waiting for player 1");
                $(".p1").find(".wins").text("");
                $(".p1").find(".losses").text("");
            };
            if(p2_exist){
                let data = snap.child("2").val();
                $(".p2").find("h2").text(data.name);
                $(".p2").find(".wins").text("Wins: "+ data.wins);
                $(".p2").find(".losses").text("Losses: "+ data.losses);
                p2_choice = data.choice;
                p2_name = data.name;    
            } else{
                $(".p2").find("h2").text("waiting for player 2");
                $(".p2").find(".wins").text("");
                $(".p2").find(".losses").text("");
            };
            turnRef.onDisconnect().remove();
        }
    })
    
//start game by setting turn to 1
    playersRef.on("child_added", function(snap){
        console.log("trigger")
        console.log("numPlayers: " +numPlayers)
        if(numPlayers===1){
            turnRef.set(1);
        } 
    })
//initiate users
var intiateUser = function(){
    if(p1_exist){
        userRole = 2;
    } else{
        userRole = 1;
    }
    database.ref("/playerData/"+userRole).set({
        name: userName,
        wins: 0,
        losses: 0
    });
    console.log(userRole)
    $(".note").html(`<h3>Hi ${userName}, you are player ${userRole}! </h3>`) 
    $(".p"+ userRole).find("h3").text(userName); 
    playersRef.child(userRole).onDisconnect().remove()  
};
var uponTurnChange = function(){
    console.log(currentTurn)
    switch(currentTurn){
        case 1:
        case 2:
            let otherRole = userRole === 1 ? 2:1;
            console.log("current turn: "+ currentTurn+ " otherRole:"+otherRole)
            if(userRole === currentTurn){
                console.log("activated")
                $(".p"+userRole+" ul").append("<li>Rock</li><li>Paper</li><li>Scissors</li>");
                $(".p"+userRole).addClass("active");
                $(".p"+otherRole).removeClass("active");
            } else {
                $(".p"+otherRole).addClass("active");
                $(".p"+userRole).removeClass("active");
            }
            break;
        case 3:
            judge();
            setTimeout(function(){
                turnRef.set(1);
                $(".picked").text("");
            }, 3000)
            break;
        default:
            $(".p"+userRole).removeClass("active");
    }
}

turnRef.on("value",function(snap){
    if(snap.val()){
        currentTurn = snap.val();
        uponTurnChange();
    } 
   
})
$(".signInButton").on("click",function(){
    event.preventDefault();
    if(numPlayers === 2){
        alert("please wait");
    } else {
        userName = $(".name").val();
        $(".signIn").empty();  
        intiateUser(); 
    }        
});
$(".player").on("click","li",function(){
    let choice = $(this).text();
    database.ref("/playerData/"+userRole+"/choice").set(choice)
    console.log("userrole +1 = " +(userRole+1));
    turnRef.transaction(function(turn) {
        return turn + 1;
      });
    console.log("after userrole +1 = " +(userRole+1));
    $(".p"+userRole+ " ul").empty();
    $(".p"+userRole).find(".picked").text(choice);
})


});