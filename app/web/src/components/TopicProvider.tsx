import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./ProgramProvider";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const accountName = "topic";

export type TopicData = {
  topicAuthor: PublicKey;
  lastCommentAuthor: PublicKey;

  topicString: string;
  lastCommentString: string;

  commentCount: BN;

  createdAt: BN;
  commentedAt: BN;

  canBeLockedAfter: BN;
  isLocked: boolean;
  feeMultiplier: BN;
  raised: BN;
};

export type CreateTopicData = {
  topicString: string;
  lastCommentString: string;
  feeMultiplier: BN;
};

export type CommentTopicData = {
  commentString: string;
};

interface TopicContextState {
  topicData: TopicData | null | undefined;
  createTopicData: (topicData: CreateTopicData) => Promise<boolean>;
  commentTopicData: (topicData: CommentTopicData) => Promise<boolean>;
  lockTopicData: () => Promise<boolean>;
  deleteTopicData: () => Promise<boolean>;
  getTopics: () => Promise<TopicData[]>;
}

export const TopicContext = createContext<TopicContextState>(
  {} as TopicContextState
);

interface TopicProviderProps {
  children: ReactNode;
  topicString: string | null;
}

export const TopicProvider: FC<TopicProviderProps> = ({
  children,
  topicString,
}) => {
  const { sendTransaction, publicKey } = useWallet();
  const { program } = useProgram();

  const { connection } = useConnection();

  const [topicData, setTopicData] = useState<TopicData | null | undefined>(
    null
  );

  useEffect(() => {
    if (topicString === null) {
      setTopicData(null);
    } else {
      setTopicData(null);

      const [topicPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(accountName), Buffer.from(topicString)],
        program.programId
      );

      const fetchTopicData = async () => {
        try {
          const data = await program.account.topic.fetch(topicPDA);
          console.log("Fetched topic data:", data);
          setTopicData(data);
        } catch (error) {
          console.error("Error fetching topic data:", error);
          setTopicData(undefined);
        }
      };

      fetchTopicData();

      const subscriptionId = connection.onAccountChange(
        topicPDA,
        (accountInfo) => {
          try {
            console.log("Changed topic data:", accountInfo);
            const decodedData = program.coder.accounts.decode(
              accountName,
              accountInfo.data
            );
            setTopicData(decodedData);
          } catch (error) {
            console.error("Error decoding topic data:", error);
            setTopicData(undefined);
          }
        }
      );

      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [connection, topicString]);

  const createTopicDataCallback = async (data: CreateTopicData) => {
    try {
      const transaction = await program.methods
        .topicCreate(
          data.topicString,
          data.lastCommentString,
          data.feeMultiplier
        )
        .accounts({
          authority: publicKey!,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log("Sent create topic transaction:", transactionSignature);
      return true;
    } catch (error) {
      console.error("Error creating topic data:", error);
      return false;
    }
  };

  const commentTopicDataCallback = async (data: CommentTopicData) => {
    try {
      const transaction = await program.methods
        .topicComment(topicString!, data.commentString)
        .accounts({
          authority: publicKey!,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log("Sent comment topic transaction:", transactionSignature);
      return true;
    } catch (error) {
      console.error("Error commenting topic data:", error);
      return false;
    }
  };

  const lockTopicDataCallback = async () => {
    try {
      const transaction = await program.methods
        .topicLock(topicString!)
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log("Sent lock topic transaction:", transactionSignature);
      return true;
    } catch (error) {
      console.error("Error locking topic data:", error);
      return false;
    }
  };

  const deleteTopicDataCallback = async () => {
    try {
      const transaction = await program.methods
        .topicDelete(topicString!)
        .accounts({
          authority: publicKey!,
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );
      console.log("Sent delete topic transaction:", transactionSignature);
      return true;
    } catch (error) {
      console.error("Error deleting topic data:", error);
      return false;
    }
  };

  const getTopicsCallback = async () => {
    try {
      const topics = await connection.getProgramAccounts(
        program.programId
        // {
        //   filters: [
        //     {
        //       dataSize: program.account.topic.size,
        //     },
        //   ],
        // }
      );
      const decodedTopics = topics
        .map((topic) => {
          try {
            return program.coder.accounts.decode(
              accountName,
              topic.account.data
            );
          } catch (error) {
            return null;
          }
        })
        .filter((topic) => topic !== null) as TopicData[];
      console.log("Fetched topic:", decodedTopics);
      return decodedTopics;
    } catch (error) {
      console.error("Error fetching topics:", error);
      return [];
    }
  };

  return (
    <TopicContext.Provider
      value={{
        topicData,
        createTopicData: createTopicDataCallback,
        commentTopicData: commentTopicDataCallback,
        lockTopicData: lockTopicDataCallback,
        deleteTopicData: deleteTopicDataCallback,
        getTopics: getTopicsCallback,
      }}
    >
      {children}
    </TopicContext.Provider>
  );
};

export const useTopic = () => {
  const context = useContext(TopicContext);

  if (context === undefined) {
    throw new Error("useTopic must be used within a TopicProvider");
  }

  return context;
};
