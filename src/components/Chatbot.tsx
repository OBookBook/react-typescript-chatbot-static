import { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

interface Message {
  text: string;
  isUser: boolean;
}

interface ConversationContext {
  lastTopic: string | null;
  userName: string | null;
  askedAboutUser: boolean;
  mentionedTopics: string[];
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const chatboxRef = useRef<HTMLDivElement>(null);

  // 会話の文脈を保存する変数
  const [conversationContext, setConversationContext] =
    useState<ConversationContext>({
      lastTopic: null,
      userName: null,
      askedAboutUser: false,
      mentionedTopics: [],
    });

  useEffect(() => {
    // 初期メッセージを表示
    setTimeout(() => {
      addBotMessage("こんにちは！何かお手伝いできることはありますか？");
    }, 1000);
  }, []);

  useEffect(() => {
    // 新しいメッセージが追加されたら、スクロールを一番下に移動
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = () => {
    const userMessage = inputValue.trim();
    if (userMessage === "") return;

    // ユーザーメッセージを追加
    addUserMessage(userMessage);
    setInputValue("");

    // ボットの応答を表示（少し遅延を入れて自然な会話感を出す）
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      addBotMessage(botResponse);
    }, 500);
  };

  const addUserMessage = (text: string) => {
    setMessages((prevMessages) => [...prevMessages, { text, isUser: true }]);
  };

  const addBotMessage = (text: string) => {
    setMessages((prevMessages) => [...prevMessages, { text, isUser: false }]);
  };

  const getBotResponse = (message: string) => {
    // メッセージを小文字に変換して処理しやすくする
    const lowerMessage = message.toLowerCase();
    let response = "";

    // 挨拶の処理
    if (
      lowerMessage.includes("こんにちは") ||
      lowerMessage.includes("はじめまして") ||
      lowerMessage.includes("やあ")
    ) {
      if (!conversationContext.askedAboutUser) {
        setConversationContext((prev) => ({
          ...prev,
          lastTopic: "greeting",
          askedAboutUser: true,
        }));
        return "こんにちは！お話できて嬉しいです。お名前を教えていただけますか？";
      } else {
        return "こんにちは！また会えて嬉しいです。何かお手伝いできることはありますか？";
      }
    }

    // 名前についての応答
    if (
      lowerMessage.includes("名前") ||
      (conversationContext.lastTopic === "greeting" &&
        !conversationContext.userName)
    ) {
      // ユーザーが自分の名前を言った可能性がある場合
      if (
        !lowerMessage.includes("あなた") &&
        !lowerMessage.includes("君") &&
        !lowerMessage.includes("きみ") &&
        !lowerMessage.includes("お前")
      ) {
        // 簡易的な名前抽出（実際にはもっと複雑な処理が必要）
        const nameMatch =
          message.match(/私は(.+)です/) ||
          message.match(/(.+)と言います/) ||
          message.match(/(.+)だよ/);
        if (nameMatch) {
          const userName = nameMatch[1];
          setConversationContext((prev) => ({
            ...prev,
            userName,
            lastTopic: "user_info",
          }));
          return `${userName}さん、はじめまして！何かお手伝いできることはありますか？`;
        }
      }

      // ボットの名前について聞かれた場合
      setConversationContext((prev) => ({
        ...prev,
        lastTopic: "bot_name",
      }));
      return "私はAIアシスタントです。あなたのお手伝いをするために存在しています。何かご質問はありますか？";
    }

    // 気分や調子についての応答
    if (
      lowerMessage.includes("元気") ||
      lowerMessage.includes("調子") ||
      lowerMessage.includes("気分")
    ) {
      setConversationContext((prev) => ({
        ...prev,
        lastTopic: "mood",
      }));

      if (lowerMessage.includes("？") || lowerMessage.includes("?")) {
        return "私は元気です！AIなので体調は変わりませんが、あなたのお役に立てることが嬉しいです。あなたはどうですか？今日はいい一日を過ごしていますか？";
      } else if (
        lowerMessage.includes("良い") ||
        lowerMessage.includes("いい") ||
        lowerMessage.includes("最高")
      ) {
        return "それは素晴らしいですね！良い気分で一日を過ごせることは大切ですよね。何か楽しいことがあったのですか？";
      } else if (
        lowerMessage.includes("悪い") ||
        lowerMessage.includes("よくない") ||
        lowerMessage.includes("疲れ")
      ) {
        return "そうですか、お疲れのようですね。少しでもリラックスできる時間が取れるといいですね。何かお力になれることはありますか？";
      }

      return "気分や体調についてのお話ですね。健康第一が大切です。何か特定のことでお悩みですか？";
    }

    // 感謝への応答
    if (lowerMessage.includes("ありがとう") || lowerMessage.includes("感謝")) {
      setConversationContext((prev) => ({
        ...prev,
        lastTopic: "gratitude",
      }));
      const responses = [
        "どういたしまして！お役に立てて嬉しいです。",
        "お役に立てて光栄です。他にも何かありましたらお気軽にどうぞ。",
        "こちらこそ、お話できて楽しいです。他に何か知りたいことはありますか？",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // 別れの挨拶
    if (
      lowerMessage.includes("さようなら") ||
      lowerMessage.includes("バイバイ") ||
      lowerMessage.includes("またね")
    ) {
      const userName = conversationContext.userName
        ? `${conversationContext.userName}さん`
        : "";
      return `${userName}さようなら！またいつでも話しかけてくださいね。良い一日をお過ごしください！`;
    }

    // 趣味や好きなことについて
    if (lowerMessage.includes("趣味") || lowerMessage.includes("好き")) {
      setConversationContext((prev) => ({
        ...prev,
        lastTopic: "hobbies",
        mentionedTopics: [...prev.mentionedTopics, "hobbies"],
      }));

      if (
        lowerMessage.includes("あなた") ||
        lowerMessage.includes("君") ||
        lowerMessage.includes("きみ") ||
        lowerMessage.includes("お前")
      ) {
        return "私の趣味は会話をすることです！人々の質問に答えたり、情報を提供したりするのが好きです。あなたの趣味は何ですか？";
      } else {
        // ユーザーが自分の趣味について話している可能性
        return "趣味についてのお話ですね！それは素晴らしい趣味だと思います。どのくらいの期間続けているのですか？";
      }
    }

    // 天気について
    if (lowerMessage.includes("天気")) {
      setConversationContext((prev) => ({
        ...prev,
        lastTopic: "weather",
        mentionedTopics: [...prev.mentionedTopics, "weather"],
      }));

      if (lowerMessage.includes("今日")) {
        return "今日の天気についてですね。残念ながら、私はリアルタイムの天気情報にアクセスできません。天気予報アプリをご確認いただくことをお勧めします。";
      } else if (lowerMessage.includes("明日")) {
        return "明日の天気予報が気になりますか？残念ながら、私は予報データを持っていません。地域の気象情報をご確認ください。";
      } else if (lowerMessage.includes("雨")) {
        return "雨の日は読書や映画鑑賞など、室内で楽しめることをするのも良いですね。何か特別な予定がありますか？";
      }

      return "天気についてのご質問ですね。具体的にどのような情報をお探しですか？";
    }

    // 食べ物について
    if (
      lowerMessage.includes("食べ物") ||
      lowerMessage.includes("料理") ||
      lowerMessage.includes("レストラン") ||
      lowerMessage.includes("美味しい")
    ) {
      setConversationContext((prev) => ({
        ...prev,
        lastTopic: "food",
        mentionedTopics: [...prev.mentionedTopics, "food"],
      }));

      if (lowerMessage.includes("好き") || lowerMessage.includes("おすすめ")) {
        return "食べ物の好みについてですね。私はAIなので実際に食べることはできませんが、多くの人は和食、イタリアン、中華など様々な料理を楽しんでいます。あなたの好きな料理は何ですか？";
      } else if (
        lowerMessage.includes("作り方") ||
        lowerMessage.includes("レシピ")
      ) {
        return "料理のレシピについてご興味があるのですね。具体的にどんな料理を作りたいですか？簡単なアドバイスならお手伝いできるかもしれません。";
      }

      return "食べ物や料理についてのお話ですね！美味しい食事は人生の楽しみの一つですよね。何か特定の料理について知りたいことはありますか？";
    }

    // 前回の話題に関連した応答
    if (conversationContext.lastTopic === "user_info") {
      return "先ほどは自己紹介ありがとうございました。何かお手伝いできることはありますか？";
    } else if (
      conversationContext.lastTopic === "hobbies" &&
      !lowerMessage.includes("趣味")
    ) {
      return "趣味についてもう少し教えてください。それはどのようにして始めたのですか？";
    } else if (
      conversationContext.lastTopic === "food" &&
      !lowerMessage.includes("食べ物")
    ) {
      return "食べ物の話題から少し脱線しましたね。他に何か話したいことはありますか？";
    }

    // 一般的な質問や会話の継続
    if (lowerMessage.includes("質問") || lowerMessage.includes("教えて")) {
      return "もちろん、何について知りたいですか？できる限りお答えします。";
    }

    if (
      lowerMessage.includes("何ができる") ||
      lowerMessage.includes("できること")
    ) {
      return "私は会話をしたり、簡単な質問に答えたり、様々な話題についてお話することができます。例えば、趣味や天気、食べ物などについて話せますよ。何か特定の話題について話しましょうか？";
    }

    // デフォルトの応答
    const defaultResponses = [
      "なるほど、興味深いですね。もう少し詳しく教えていただけますか？",
      "申し訳ありませんが、よく理解できませんでした。別の言い方で教えていただけますか？",
      "その話題について詳しく知りたいです。具体的に何が知りたいですか？",
      "面白い話題ですね！もっと教えてください。",
      "すみません、うまく理解できませんでした。質問の仕方を変えていただけますか？",
    ];

    return defaultResponses[
      Math.floor(Math.random() * defaultResponses.length)
    ];
  };

  return (
    <div className="chat-container">
      <div className="chat-header" onClick={toggleChat}>
        <h3>AIアシスタント</h3>
        <span id="toggleChat">{isOpen ? "▼" : "▲"}</span>
      </div>
      {isOpen && (
        <>
          <div id="chatbox" className="message-container" ref={chatboxRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.isUser ? "user-message" : "bot-message"}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="input-area">
            <input
              type="text"
              id="userInput"
              placeholder="メッセージを入力..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <button id="sendButton" onClick={sendMessage}>
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
