
declare class AMPopTip extends UIView {

	static alloc(): AMPopTip; // inherited from NSObject

	static appearance(): AMPopTip; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): AMPopTip; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): AMPopTip; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): AMPopTip; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): AMPopTip; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): AMPopTip; // inherited from UIAppearance

	static new(): AMPopTip; // inherited from NSObject

	static popTip(): AMPopTip;

	actionAnimation: AMPopTipActionAnimation;

	actionAnimationIn: number;

	actionAnimationOut: number;

	actionBounceOffset: number;

	actionDelayIn: number;

	actionDelayOut: number;

	actionFloatOffset: number;

	actionPulseOffset: number;

	animationIn: number;

	animationOut: number;

	appearHandler: () => void;

	readonly arrowPosition: CGPoint;

	arrowSize: CGSize;

	borderColor: UIColor;

	borderWidth: number;

	bubbleOffset: number;

	readonly containerView: UIView;

	delayIn: number;

	delayOut: number;

	readonly direction: AMPopTipDirection;

	dismissHandler: () => void;

	edgeInsets: UIEdgeInsets;

	edgeMargin: number;

	entranceAnimation: AMPopTipEntranceAnimation;

	entranceAnimationHandler: (p1: () => void) => void;

	exitAnimation: AMPopTipExitAnimation;

	exitAnimationHandler: (p1: () => void) => void;

	font: UIFont;

	fromFrame: CGRect;

	readonly isAnimating: boolean;

	readonly isVisible: boolean;

	offset: number;

	padding: number;

	popoverColor: UIColor;

	radius: number;

	rounded: boolean;

	shouldDismissOnSwipeOutside: boolean;

	shouldDismissOnTap: boolean;

	shouldDismissOnTapOutside: boolean;

	swipeRemoveGestureDirection: UISwipeGestureRecognizerDirection;

	tapHandler: () => void;

	textAlignment: NSTextAlignment;

	textColor: UIColor;

	dismissActionAnimation(): void;

	hide(): void;

	pathWithRectDirection(rect: CGRect, direction: AMPopTipDirection): UIBezierPath;

	performActionAnimation(): void;

	performEntranceAnimation(completion: () => void): void;

	performExitAnimation(completion: () => void): void;

	showAttributedTextDirectionMaxWidthInViewFromFrame(text: NSAttributedString, direction: AMPopTipDirection, maxWidth: number, view: UIView, frame: CGRect): void;

	showAttributedTextDirectionMaxWidthInViewFromFrameDuration(text: NSAttributedString, direction: AMPopTipDirection, maxWidth: number, view: UIView, frame: CGRect, interval: number): void;

	showCustomViewDirectionInViewFromFrame(customView: UIView, direction: AMPopTipDirection, view: UIView, frame: CGRect): void;

	showCustomViewDirectionInViewFromFrameDuration(customView: UIView, direction: AMPopTipDirection, view: UIView, frame: CGRect, interval: number): void;

	showTextDirectionMaxWidthInViewFromFrame(text: string, direction: AMPopTipDirection, maxWidth: number, view: UIView, frame: CGRect): void;

	showTextDirectionMaxWidthInViewFromFrameDuration(text: string, direction: AMPopTipDirection, maxWidth: number, view: UIView, frame: CGRect, interval: number): void;

	startActionAnimation(): void;

	stopActionAnimation(): void;

	updateText(text: string): void;
}

declare const enum AMPopTipActionAnimation {

	Bounce = 0,

	Float = 1,

	Pulse = 2,

	None = 3
}

declare const enum AMPopTipDirection {

	Up = 0,

	Down = 1,

	Left = 2,

	Right = 3,

	None = 4
}

declare const enum AMPopTipEntranceAnimation {

	Scale = 0,

	Transition = 1,

	FadeIn = 2,

	None = 3,

	Custom = 4
}

declare const enum AMPopTipExitAnimation {

	Scale = 0,

	FadeOut = 1,

	None = 2,

	Custom = 3
}

declare var AMPopTipVersionNumber: number;

declare var AMPopTipVersionString: interop.Reference<number>;
