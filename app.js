//required modules
var
Flickr = require("flickrapi"),
fs = require("fs"),
http = require("http"),
colors = require("colors");

//Globals
var
connections=0,
limit = 10,
queue={
  "list":[]
};

//configuration for flickr node library
var flickrOptions = {
  api_key: "[Your API Key]",
  secret: "[Your API Secret]"
/*
  Remember to add the comma
  access_token: "", //you'll get this after authorizing the app
  access_token_secret: "", //you'll get this after authorizing the app
  user_id: "" //you'll get this after authorizing the app
*/
};

var createFolder = function(path){
  fs.exists('./data/'+path,function(exists){
    if (!exists) {
      fs.mkdir('./data/'+path);
      console.log('created '+path+' folder'.yellow);
    }else{
      console.log(path+' folder already exists'.red);
    }
  });
};
console.log('Flickr back-up script started!'.rainbow);

Flickr.authenticate(flickrOptions, function(error,flickr){
  //after authentication with flickr do all this stuff
  console.log("auth'd successful!");
  if (error) {
    console.log(error);
    return;
  }

  //make images folder
  createFolder('images');

  var checkFile=function(path,filename,photo_id){
    //check if the photo already exists
    fs.exists(path,function(exists){
      if (exists===false) {
            //if file doesn't exist
            if (connections<limit) {
              connections++;
              console.log(filename+" is going to be downloaded.");
                //download file
                downloadPhoto(path,filename,photo_id);
              }else{
                console.log("max # connections reached!".red);
                //add file to queue if we've reached the max number of connection
                queue.list.push({"path":path,"filename":filename,"id":photo_id});
                console.log("file added to queue:",queue.list.length);
              }
            }else{
              console.log(filename+" already exists.");
            }

          });
  };

  var processQueue = function(){
    if (queue.list.length>0) {
      var target = queue.list[0];
      //if there are queue items
      //grab first item off queue
      //remove item from queue
      if (connections<limit) {
        queue.list.splice(0,1);
        //download item
        connections++;
        downloadPhoto(target.path,target.filename,target.id);
        console.log("queue length:",queue.list.length);
      }else{
        console.log("max # connections reached!".red);
      };
    }else{
      //if there are no queue itmes left
      console.log("queue is empty".yellow);
    }
  };

  var getPhotosList= function(setId,dest){
    //get list of photos in a set
    flickr.photosets.getPhotos({
      photoset_id: setId
    },
    function(err, res){
      console.log("# of photos:".blue,res.photoset.photo.length);
      console.log("destination path:".blue,dest.blue);
      for (var i = 0; i < res.photoset.photo.length; i++) {
        var
        photo_id=res.photoset.photo[i].id,
        targetFilePath = "./data/images/"+dest+"/"+dest+"_"+i+".jpg";
        targetFile=dest+"_"+i+".jpg";
        checkFile(targetFilePath,targetFile,photo_id);
      }
    });
  };



  var downloadPhoto = function(path,filename,id){
      var downloadFile = function(url){
       console.log("connections:"+connections);
       var tempFile = fs.createWriteStream(path+".tmp");
       console.log(filename+ " has started downloading".blue);
       console.log("connections:"+connections);

       tempFile.on('open', function() {
        http.get(url, function(res) {
          res.on('data', function(chunk){
            tempFile.write(chunk);
          }).on('end', function() {
            tempFile.end();
            fs.renameSync(tempFile.path, path);
            if (connections>0) {
              connections--;
            };
            //after a successful download, process queue
            processQueue();
            console.log(filename.yellow + " has finished downlading!".yellow);
          });
        }).on("error",function(e){
          //attempt to handle errors, but not really doing much about them
          console.log("error!".red);
          console.log(e);

        });
      });
     };


      //get the source url of the largest size available
      flickr.photos.getSizes({
        photo_id: id
      },function(err,res){
        if (err) {
          console.log(err);
          return;
        }
        var sourceUrl=res.sizes.size[res.sizes.size.length-1].source;
        //after grabbing url download the file
        downloadFile(sourceUrl);
      });
    };
  //Get list of photosets
  flickr.photosets.getList(
    {user_id: flickr.options.user_id},
    function(error,response){
      for(i=0;i<response.photosets.photoset.length;i++){
        //normalize set title, so it can be used as a folder name
        var rawTitle=response.photosets.photoset[i].title._content;
        var cleanTitle = rawTitle.replace(/[|&:;$%@"<>()+,]/g, "");
        cleanTitle = cleanTitle.replace(/\//g,"");
        cleanTitle = cleanTitle.replace(/ /g,"_");
        cleanTitle=cleanTitle.trim();

        var id = response.photosets.photoset[i].id;

        //create folder on disk
        createFolder('images/'+cleanTitle);
        getPhotosList(id,cleanTitle);
      }
      console.log("# of sets:",response.photosets.photoset.length);
    });
});
