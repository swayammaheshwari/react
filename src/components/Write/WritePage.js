import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import EditorJS from "@editorjs/editorjs";
import ImageTool from '@editorjs/image';
import List from "@editorjs/list";
import "./Write.css";
import useTitle from "../hooks/useTItle";
import { toast } from "react-hot-toast";
import { useAsyncError } from "react-router-dom";

const Header = require('@editorjs/header');
const Quote = require('@editorjs/quote');


const Write = () => {
  const [array, setArray] = useState([]);
  const [blogId, setBlogId] = useState([]);
  const [userid, setID] = useState([])
  const [blogBody, setBody] = useState([]);

  const dataFetchedRef = useRef(false);

  useTitle("Write");

  function getSavedData(blogId){
    console.log('inside saved data')
    fetch(`http://100.25.166.88:8080/blog?blogId=${blogId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data in saved data = ", data[0]);
        console.log("body in saved data = ", data[0].body);
        if (data[0].body) {
          setBody(data[0].body);
          setUpEditor(data[0].body)
        }
        else{
          setUpEditor([])
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Blog not published.Please login again")
      });
  }

  function saving() {
    editor.save().then((savedData) => {
      console.log("data in saving fucntion = ", savedData);
      setArray(savedData);
    });
  }

    useEffect(() => {
        const userid = JSON.parse(localStorage.getItem('user'));
        setID(userid);
        console.log("user id in useEffect =", userid)
        setBlogId(window.location.pathname.split('/')[2])
      }, []);

  const [editor, setEditor] = useState({isReady:false});

  function setUpEditor(body){
    if (!editor.isReady) {
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      console.log("body in editor ", blogBody)
      let editor1 = new EditorJS({
        autofocus: true,
        holder: "editorjs",
        data: body,
        tools: {
          quote: Quote,
          header: Header,
          image: {
            class: ImageTool,
              config: {
                endpoints: {
                  byFile: 'http://100.25.166.88:8080/image', // Your backend file uploader endpoint
                  byUrl: 'http://100.25.166.88:8080/image', // Your endpoint that provides uploading by Url
                },
                additionalRequestData: {
                  "userId": 'asdas',
                  "blogId": "12345"
                },
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            }
          }
        }
      });
      setEditor(editor1);
    }
  }

  useEffect(() => {
    getSavedData(window.location.pathname.split('/')[2])
    }, [editor]);

  function updateBlog() {
    console.log('inside handleWriteBlog')
    saving();
    const blog = {
      id: blogId,
      body: array,
    };

    fetch("http://100.25.166.88:8080/updateBlog", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(blog),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("blog = ", blog)
        console.log(data);
        if (data.message) {
          console.log(data.message)
          toast.success(`Blog added successfully with title ${blog["title"]}`);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Blog not published.Please login again")
      });
  };


  return (
    <div>
        <button className="writeSubmit all-btn" id="submit-blog" onClick={updateBlog}>Publish</button>
        <div className="text-area">
          <pre id="output"></pre>
          <div className="details-blog" id="editorjs" ></div>
        </div>
    </div>
  );
};

export default Write;
