import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Button, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import './EditorPage.css';
import ResponseModal from '../components/modal/Modal';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const defaultValues = {
  JAVA: `public class Main {
    public static void main(String[] args) {
        System.out.print(15); 
    }
}`,

  PYTHON: `def add_numbers(a, b):
    return a + b

result = add_numbers(10, 5)
print(result, end='')`,

  CPP: `#include <iostream>

int addNumbers(int a, int b) {
    return a + b;
}

int main() {
    int result = addNumbers(10, 5);
    std::cout << result;  // 줄바꿈 없이 출력: 15
    return 0;
}
`

};

function EditorPage() {
  const { id } = useParams(); // 퀴즈 ID에 해당
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseData, setResponseData] = useState({});
  const [quiz, setQuiz] = useState({ quiz_title: '', quiz_content: '', quiz_reg_date: '' });
  const [selectedLanguage, setSelectedLanguage] = useState("JAVA");
  const [editorValue, setEditorValue] = useState(defaultValues.JAVA);

  useEffect(() => {
    axios.get(`https://k618de24a93cca.user-app.krampoline.com/api/quiz/detail/${id}?userId=1`)
      .then(response => {
        console.log('response :', response);
        const data = response.data;
        console.log('Fetched problem data:', data);
        setQuiz(data);
      })
      .catch(error => {
        console.error('Error fetching problem data:', error);
      });
  }, [id]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function runCode() {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      const requestData = {
        quizId: id,
        language: selectedLanguage,
        code: code,
        userId: 1
      };
      console.log("reqData :", requestData);
      axios.post("https://k618de24a93cca.user-app.krampoline.com/api/ide/run", requestData)
        .then(response => {
          const data = response.data;
          console.log("response data:", data);
          setOutput(data.result);
          setResponseData(data);
          setIsModalOpen(true);
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleLanguageChange(event) {
    const selectedLang = event.target.value;
    setSelectedLanguage(selectedLang);
    setEditorValue(defaultValues[selectedLang]);
  }

  return (
    <div className="editor-page">
      <div className="problem-container">
        <Tabs defaultActiveKey="basic" id="problem-tabs">
          <Tab eventKey="basic" title="기본 개념" className="tab-content">
            <div className="basic-content">
              기본 개념 내용
            </div>
          </Tab>
          <Tab eventKey="problem" title="문제" className="tab-content">
            <div className="problem-name">
              {quiz.quizTitle}
            </div>
            <div className="problem-content">
              {quiz.quizContent ? quiz.quizContent.split('\\n').map((line, index) => (
                <div key={index}>{line}</div>
              )) : 'Loading...'}
            </div>
            <div className="problem-detail">
              <div className="problem-detail-name">
                주의사항? 입출력예제?
              </div>
              {quiz.quizRegDate ? quiz.quizRegDate.split('\\n').map((line, index) => (
                <div key={index}>{line}</div>
              )) : 'Loading...'}
            </div>
          </Tab>
          <Tab eventKey="qnaboard" title="질의응답">
            <div className="placeholder-content">
              {/* 여기에 나중에 내용을 추가할 수 있습니다 */}
            </div>
          </Tab>
        </Tabs>
      </div>

      <div className="editor-container">

        <div className="horizontal-menu">
          <div>언어 선택</div>
          <div className="language-container">
            <div>
              <input
                type="radio"
                id="java"
                name="language"
                value="JAVA"
                checked={selectedLanguage === "JAVA"}
                onChange={handleLanguageChange}
              />
              <label htmlFor="java">Java</label>
            </div>
            <div>
              <input
                type="radio"
                id="python"
                name="language"
                value="PYTHON"
                checked={selectedLanguage === "PYTHON"}
                onChange={handleLanguageChange}
              />
              <label htmlFor="python">Python</label>
            </div>
            <div>
              <input
                type="radio"
                id="cpp"
                name="language"
                value="CPP"
                checked={selectedLanguage === "CPP"}
                onChange={handleLanguageChange}
              />
              <label htmlFor="cpp">C++</label>
              <ArrowLeftIcon />
            </div>
          </div>
        </div>

        <div className="editor-box">
          <Editor
            width="100%"
            height="100%"
            language={selectedLanguage.toLowerCase()}
            theme="vs-dark"
            value={editorValue}
            onMount={handleEditorDidMount}
            options={{
              padding: {
                top: 10
              }
            }}
          />
        </div>
        <div className="run-btn">
          <Button variant="outline-dark" onClick={runCode}>답안제출</Button>
        </div>
        <div className="output-container">
          <div className="output-title">Output: {output}</div>
          <p><strong>Answer:</strong> {responseData.answer}</p>
          <p><strong>Correct:</strong> {responseData.correct ? 'True' : 'False'}</p>
          <p><strong>Error Message:</strong> {responseData.errorMessage || 'None'}</p>
          <p><strong>Memory Usage:</strong> {responseData.memoryUsage}</p>
          <p><strong>Result:</strong> {responseData.result}</p>
          <p><strong>Run Time:</strong> {responseData.runTime}</p>
        </div>
        <ResponseModal
          show={isModalOpen}
          onHide={closeModal}
          responseData={responseData}
        />
      </div>
    </div>
  );
}

export default EditorPage;
