import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { BigNumber, Contract, utils, providers } from "ethers";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  NFT_CONTRACT_ABI,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  //To keep track of if the user's wallet is connected we set a variable
  const [walletConnected, setconnectWalleted] = useState(false);
  //To connect we need to use the web3modal in connection with useRef to keep our site connected to the wallet
  const web3ModalRef = useRef();
  //To get the number of total tokens we set a variable
  const [tokensMinted, setTokenMinted] = useState(zero);
  //To keep track of the number of token minted by the user we make a variabe
  const [balanceOfLoveMinted, setbalanceOfLoveMinted] = useState(zero);
  //This variable keeps track of the number of tokens the user wishes to mint
  const [tokenAmount, setTokenAmount] = useState(zero);
  //This variable is called whenever a transaction is taking place
  const [loading, setLoading] = useState(false);
  //Here we set the amount of token that can be claimed
  const [tokenToClaim, setTokenToClaim] = useState(zero);
  //This gets the owner of the through the signed transaction
  const [isOwner, setIsOwner] = useState(false);

  //This function gets the provider(metamask) or Signer(individual) currently transacting on the contract.
  /**
   
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    //It also checks to see what kinder of provider the user is connected to, metamask in this case.
    //The provider is used to read a state from a contract, this used to read from the current account the user is connected with
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    //To get the network of which our wallet is on and also determine what it should be on
    const { chainId } = await web3Provider.getNetwork();
    //To make sure the user is connected with the right network
    if (chainId !== 5) {
      window.alert("Please switch wallet network to the goerli");
      throw new Error("Change network to goerli");
    }
    //If the trx needs a signer this function gets a signer to do the needful else the povider is given.
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  //This function is to know the number of nfts so it culd be used to determine the number of tokens the user can claim
  const getTokentoBeClaimed = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if (balance === zero) {
        setTokenToClaim(zero);
      } else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokenToClaim(BigNumber.from(amount));
      }
    } catch (error) {
      console.error(error);
      setTokenToClaim(zero);
    }
  };

  //This gets the balancee of the Nfts ownered by a user.
  const getbalanceOfLoveToken = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setbalanceOfLoveMinted(balance);
    } catch (error) {
      console.error(error);
    }
  };
  //This function get the total amount of tokens that has ben already in the whole world.
  const getTokenMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );

      const _total = await tokenContract.maxTotalSupply();
      setTokenMinted(_total);
    } catch (error) {
      console.error(error);
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // call the owner function from the contract
      const _owner = await tokenContract.owner();
      // we get signer to extract address of currently connected Metamask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to signer which is connected to Metamask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
    }
  };
  //To connect the wallet succesfully we need to make sure certain functions/conditions are true.
  //This function are embedded within the function.
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setconnectWalleted(true);
    } catch (error) {
      console.error(error);
    }
  };

  //This function is used to mint the token
  const mintLoveToken = async (amount) => {
    try {
      //We need a signer here because we are going to change the state of the contract.
      const signer = await getProviderOrSigner(true);
      //We now import our contract instance
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      //Below we set the value we want to our tokens to be minted for
      const value = 0.001 * amount;
      const tx = await tokenContract.mint(amount, {
        //The value was convrted to a string then later converted to a big number so it could be understandable.
        value: utils.parseEther(value.toString()),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Congratulations you Succesfully Minted Some tokens.");
      await getbalanceOfLoveToken();
      await getTokenMinted();
      await getTokentoBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };

  const claimLovetoken = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );
      const _claim = await tokenContract.claim();
      setLoading(true);
      await _claim.wait();
      setLoading(false);
      window.alert("You just successfully claimed your tokens");
      await getbalanceOfLoveToken();
      await getTokenMinted();
      await getTokentoBeClaimed();
    } catch (error) {
      console.error(error);
    }
  };

  //It is also called immediately a page gets rendered or while loading.
  //This helps us connect the wallet of the user as soon as they login to the site
  //And also keeps the wallet connected throuhout the sectio f which the user uses the site
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getbalanceOfLoveToken();
      getTokenMinted();
      getTokentoBeClaimed();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (loading) {
      return (
        <div>
          <button className={styles.button}>Please Wait...</button>
        </div>
      );
    }
    if (walletConnected && isOwner) {
      return (
        <div>
          <button className={styles.button1} onClick={withdrawCoins}>
            Withdraw Coins
          </button>
        </div>
      );
    }
    if (tokenToClaim > 0) {
      return (
        <div>
          <div className={styles.description}>
            Congratulations {tokenToClaim * 10} can be claimed
          </div>
          <button className={styles.button} onClick={claimLovetoken}>
            Claim Tokens
          </button>
        </div>
      );
    }
    return (
      //The styling in this div makes it possible for us to display our divs in different columns on the screen
      <div style={{ display: "flex-col" }}>
        <div>
          <input
            type="number"
            placeholder="Input amount of token"
            onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
            className={styles.input}
          />
        </div>
        <button
          className={styles.button}
          disabled={!(tokenAmount > 0)}
          onClick={() => mintLoveToken(tokenAmount)}
        >
          Mint Token
        </button>
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>Life Token Ico</title>

        <meta name="description" content="Site for Life Token Minting" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Life Token Ico</h1>
          <div className={styles.description}>
            You can claim or claim tokens here &#128640;
          </div>
          {walletConnected ? (
            <div>
              <div className={styles.description}>
                Congratulations you have minted_
                {utils.formatEther(balanceOfLoveMinted)}
              </div>
              <div className={styles.description}>
                {/* //The keyword util.formatEther helps change BigNumber to understandable string to our users */}
                {utils.formatEther(tokensMinted)} / 10000 of Love token has been
                minted.
              </div>
              {renderButton()}
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect Wallet
            </button>
          )}
        </div>
        <div>
          <img className={styles.Image} src="./love.jpg" />
        </div>
      </div>

      <footer className={styles.footer}>
        This project was built with love &#10084; to serve as a light to the
        sadden heart
      </footer>
    </div>
  );
}
