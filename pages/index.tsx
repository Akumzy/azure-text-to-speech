import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { SpeechConfig, SpeechSynthesisOutputFormat, SpeechSynthesizer } from 'microsoft-cognitiveservices-speech-sdk';
import snakeCase from 'lodash-es/snakeCase';
import truncate from 'lodash-es/truncate';
const Home: NextPage = () => {
  const [voice, setVoice] = useState(voiceOptions[0].value);
  const [text, setText] = useState('');
  const [subscriptionKey, setSubscriptionKey] = useState('');
  const [region, setRegion] = useState('westus');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const speechConfig = useMemo(() => {
    if (!subscriptionKey || !region) {
      return null;
    }
    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

    return speechConfig;
  }, [subscriptionKey, region]);
  async function speak() {
    if (!speechConfig) {
      return alert('Please enter subscription key and region');
    }
    speechConfig.speechSynthesisVoiceName = voice;

    const synthesizer = new SpeechSynthesizer(speechConfig);
    setIsPlaying(true);
    synthesizer;
    synthesizer.speakTextAsync(
      text,
      (result) => {
        setIsPlaying(false);
        if (result) {
          synthesizer.close();
          const url = window.URL.createObjectURL(new Blob([result.audioData]));
          setDownloadUrl(url);
        }
      },
      (error) => {
        synthesizer.close();
        setIsPlaying(false);
        console.log(error);
        alert(`Error: ${error}`);
      },
    );
  }
  function onDownload() {
    if (!downloadUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${snakeCase(truncate(text, { length: 20 }))}.mp3`;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    }, 0);
  }

  useEffect(() => {
    if (subscriptionKey) {
      localStorage.setItem('subscriptionKey', subscriptionKey);
    }
  }, [subscriptionKey]);
  useEffect(() => {
    if (text) {
      localStorage.setItem('text', text);
    }
  }, [text]);
  useEffect(() => {
    const subscriptionKey = localStorage.getItem('subscriptionKey');
    const textValue = localStorage.getItem('text');
    if (subscriptionKey) {
      setSubscriptionKey(subscriptionKey);
    }
    if (textValue) {
      setText(textValue);
    } else {
      setText('Hello world');
    }
  }, []);
  return (
    <div>
      <Head>
        <title>Azure Cognitive Services Speech</title>
      </Head>
      <div className="w-full h-screen  p-10">
        <div className="w-full h-4/6 flex">
          <form className="h-5/6 w-7/12 pt-2">
            <textarea
              onChange={(v) => setText(v.target.value)}
              className=" w-full h-full border-slate-500 border border-solid p-4 resize-none"
              placeholder="Type here..."
              value={text}
            />
          </form>
          <form className="w-5/12 h-full pl-10">
            <label htmlFor="language" className="text-slate-600">
              Language{' '}
            </label>
            <br />
            <select name="language" className="ml-1 mt-1 border border-slate-500 border-solid p-1 text-slate-600 w-full mb-4">
              <option value="English (United States)">English (United States)</option>
            </select>

            <label htmlFor="voice" className="text-slate-600">
              Voice{' '}
            </label>
            <br />
            <select
              value={voice}
              onChange={(v) => setVoice(v.target.value)}
              name="voice"
              className="ml-1 border mt-1 border-slate-500 border-solid p-1 text-slate-600 w-full mb-4"
            >
              {voiceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex">
              <button
                disabled={isPlaying}
                type="button"
                onClick={speak}
                className=" bg-blue-600 text-white mr-4 rounded px-4 h-10 disabled:bg-opacity-40"
              >
                {isPlaying ? 'Playing...' : 'Play'}
              </button>
              <button type="button" onClick={onDownload} className=" bg-blue-600 text-white rounded px-4 h-10">
                Download
              </button>
            </div>
          </form>
        </div>
        <div className="w-full h-2/6">
          <details>
            <summary className="text-slate-600">Advanced</summary>
            <div className="w-full h-full flex space-x-4">
              <div className="w-1/2 h-full">
                <label htmlFor="subscriptionKey" className="text-slate-600">
                  Subscription Key
                </label>
                <br />
                <input
                  id="subscriptionKey"
                  type="text"
                  name="subscriptionKey"
                  value={subscriptionKey}
                  className="ml-1 mt-1 border border-slate-500 border-solid p-1 text-slate-600 w-full mb-4"
                  onChange={(v) => setSubscriptionKey(v.target.value)}
                />
              </div>
              <div className="w-1/2 h-full">
                <label htmlFor="region" className="text-slate-600">
                  Region
                </label>
                <br />
                <input
                  id="region"
                  type="text"
                  name="region"
                  value={region}
                  className="ml-1 mt-1 border border-slate-500 border-solid p-1 text-slate-600 w-full mb-4"
                  onChange={(v) => setRegion(v.target.value)}
                />
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
const voiceOptions = [
  { value: 'en-US-JennyNeural', label: 'Jenny (Neural)' },
  {
    value: 'en-US-JennyMultilingualNeural',
    label: 'Jenny Multilingual (Neural)',
  },
  { value: 'en-US-GuyNeural', label: 'Guy (Neural)' },
  { value: 'en-US-AmberNeural', label: 'Amber (Neural)' },
  { value: 'en-US-AnaNeural', label: 'Ana (Neural)' },
  { value: 'en-US-AriaNeural', label: 'Aria (Neural)' },
  { value: 'en-US-AshleyNeural', label: 'Ashley (Neural)' },
  { value: 'en-US-BrandonNeural', label: 'Brandon (Neural)' },
  { value: 'en-US-ChristopherNeural', label: 'Christopher (Neural)' },
  { value: 'en-US-CoraNeural', label: 'Cora (Neural)' },
  { value: 'en-US-ElizabethNeural', label: 'Elizabeth (Neural)' },
  { value: 'en-US-EricNeural', label: 'Eric (Neural)' },
  { value: 'en-US-JacobNeural', label: 'Jacob (Neural)' },
  { value: 'en-US-MichelleNeural', label: 'Michelle (Neural)' },
  { value: 'en-US-MonicaNeural', label: 'Monica (Neural)' },
  { value: 'en-US-SaraNeural', label: 'Sara (Neural)' },
  { value: 'en-US-AIGenerate1Neural', label: 'AIGenerate1 (Neural) - Preview' },
  { value: 'en-US-AIGenerate2Neural', label: 'AIGenerate2 (Neural) - Preview' },
  { value: 'en-US-DavisNeural', label: 'Davis (Neural) - Preview' },
  { value: 'en-US-JaneNeural', label: 'Jane (Neural) - Preview' },
  { value: 'en-US-JasonNeural', label: 'Jason (Neural) - Preview' },
  { value: 'en-US-NancyNeural', label: 'Nancy (Neural) - Preview' },
  { value: 'en-US-RogerNeural', label: 'Roger (Neural) - Preview' },
  { value: 'en-US-TonyNeural', label: 'Tony (Neural) - Preview' },
];
export default Home;
