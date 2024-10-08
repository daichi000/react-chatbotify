import { MouseEvent } from "react";

import ChatBotHeader from "./ChatBotHeader/ChatBotHeader";
import ChatBotBody from "./ChatBotBody/ChatBotBody";
import ChatBotInput from "./ChatBotInput/ChatBotInput";
import ChatBotFooter from "./ChatBotFooter/ChatBotFooter";
import ChatBotButton from "./ChatBotButton/ChatBotButton";
import ChatBotTooltip from "./ChatBotTooltip/ChatBotTooltip";
import { isDesktop } from "../utils/displayChecker";
import { useButtonInternal } from "../hooks/internal/useButtonInternal";
import { useFirstInteractionInternal } from "../hooks/internal/useFirstInteractionInternal";
import { useChatWindowInternal } from "../hooks/internal/useChatWindowInternal";
import { useBotEffectInternal } from "../hooks/internal/useBotEffectInternal";
import { useBotRefsContext } from "../context/BotRefsContext";
import { useSettingsContext } from "../context/SettingsContext";
import { useStylesContext } from "../context/StylesContext";

import "./ChatBotContainer.css";

/**
 * Integrates and contains the various components that makeup the chatbot.
 */
const ChatBotContainer = () => {
	// handles settings
	const { settings } = useSettingsContext();

	// handles styles
	const { styles } = useStylesContext();

	// handles bot refs
	const { inputRef } = useBotRefsContext();

	// handles chat window
	const { chatScrollHeight,
		setChatScrollHeight,
		viewportHeight,
		viewportWidth,
		isChatWindowOpen,
	} = useChatWindowInternal();

	// handles user first interaction
	const { hasFlowStarted, setHasFlowStarted } = useFirstInteractionInternal();

	// buttons to show in header, chat input and footer
	const { headerButtons, chatInputButtons, footerButtons } = useButtonInternal();

	// loads all use effects
	useBotEffectInternal();

	/**
	 * Retrieves class name for window state.
	 */
	const getWindowStateClass = () => {
		const windowClass = "rcb-chat-bot ";
		if (settings.general?.embedded) {
			return windowClass + "rcb-window-embedded";
		} else if (isChatWindowOpen) {
			return windowClass + "rcb-window-open";
		}
		return windowClass + "rcb-window-close"
	}

	/**
	 * Retrieves styles for chat window.
	 */
	const getChatWindowStyle = () => {
		if (!isDesktop && !settings.general?.embedded) {
			return {
				...styles.chatWindowStyle,
				borderRadius: "0px",
				left: "0px",
				right: "auto",
				top: "0px",
				bottom: "auto",
				width: `${viewportWidth}px`,
				height: `${viewportHeight}px`,
			}
		}
		return styles.chatWindowStyle;
	}

	return (
		<div 
			onMouseDown={(event: MouseEvent) => {
				// checks if user is interacting with chatbot for the first time
				if (!hasFlowStarted && settings.general?.flowStartTrigger === "ON_CHATBOT_INTERACT") {
					setHasFlowStarted(true);
				}

				// if not on mobile, should remove focus
				isDesktop ? inputRef.current?.blur() : event?.preventDefault();
			}}
			className={getWindowStateClass()}
		>
			<ChatBotTooltip/>
			<ChatBotButton/>
			{/* styles and prevents background from scrolling on mobile when chat window is open */}
			{isChatWindowOpen && !isDesktop && !settings.general?.embedded &&
				<>
					<style>
						{`
							html {
								overflow: hidden !important;
								touch-action: none !important;
								scroll-behavior: auto !important;
							}
						`}
					</style>
					<div 
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							backgroundColor: "#fff",
							zIndex: 9999
						}}
					>	
					</div>
				</>
			}
			<div style={getChatWindowStyle()} className="rcb-chat-window">
				{settings.general?.showHeader && <ChatBotHeader buttons={headerButtons}/>}
				<ChatBotBody chatScrollHeight={chatScrollHeight} setChatScrollHeight={setChatScrollHeight}/>
				{settings.general?.showInputRow && <ChatBotInput buttons={chatInputButtons}/>}
				{settings.general?.showFooter && <ChatBotFooter buttons={footerButtons}/>}
			</div>
		</div>
	);
};

export default ChatBotContainer;
