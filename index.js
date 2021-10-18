const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browsebtn")
const fileInput = document.querySelector("#fileInput");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");

const fileURLInput = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");


const host = "https://file-share-you.herokuapp.com";
const uploadURL = `${host}/api/files`;
const emailURL = `${host}/api/files/send`;

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");

    const files = e.dataTransfer.files;
    console.log(files);
    
    if(files.length){
        
        fileInput.files = files;
        uploadFile();
    }
})

fileInput.addEventListener("change", ()=>{
    uploadFile();
})

browseBtn.addEventListener("click", ()=>{
    fileInput.click();
});

copyBtn.addEventListener("click", ()=>{
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link copied");
});

const uploadFile = () => {

    progressContainer.style.display = 'block';

    const file = fileInput.files[0];
    const formData = new FormData();

    formData.append("myfile",file);
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE){
            onUploadSuccess(JSON.parse(xhr.response));
        }
        
    }

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        fileInput.value = "";
        showToast(`Err in upload : ${xhr.statusText}`);
    }

    xhr.open("POST",uploadURL);
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.send(formData);
};

const updateProgress = (e) => {
    
    const persent = Math.round((e.loaded / e.total) * 100);
    bgProgress.style.width = `${persent}%`;
    percentDiv.innerText = persent;
    progressBar.style.transform = `scaleX(${persent/100})`;
}

const onUploadSuccess = ({file: url}) => {

    fileInput.value = "";
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = 'none';
    sharingContainer.style.display = "block";
    fileURLInput.value = url;
};

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const url = fileURLInput.value;

    const formData = {
        uuid : url.split("/").splice(-1,1)[0],
        emailTo : emailForm.elements["to-email"].value,
        emailFrom : emailForm.elements["from-email"].value
    }

    emailForm[2].setAttribute("disabled","true");
    console.table(formData);

    fetch(emailURL,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(({success}) => {
        if(success){
            sharingContainer.style.display = "none";
            showToast("Email Sent Successfully");
        }
    })
    .catch(err => console.log(err));
});

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(toastTimer);
     toastTimer = setTimeout(()=>{
        toast.style.transform = "translate(-50%,60px)";
    },2000);

}
