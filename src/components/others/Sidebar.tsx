"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

export type LinkMeta = {
	name: string;
	href: string;
};

export type LinkGroup = {
	name: string;
	href?: string;
	links: SidebarLink[];
	expanded?: boolean;
	/**
	 * If set to false, the the group will not be rendered as an accordion
	 * @defaultValue true
	 */
	isCollapsible?: boolean;
	icon?: StaticImport | React.ReactElement;
};

export function isStaticImport(value: any): value is StaticImport {
	const isObj = typeof value === "object" && value !== null;
	if (!isObj) {
		return false;
	}

	return "default" in value || "src" in value;
}

export type SidebarLink = LinkMeta | LinkGroup;

type ReferenceSideBarProps = {
	links: SidebarLink[];
	onLinkClick?: () => void;
	name: string;
};

export function DocSidebar(props: ReferenceSideBarProps) {
	return (
		<div className="flex h-full flex-col">
			{/* Side bar Name */}
			<p className="py-5 text-lg font-semibold text-f-100">{props.name}</p>

			<ul className="styled-scrollbar transform-gpu overflow-y-scroll pb-10 pr-3">
				{props.links.map((link, i) => (
					<li key={i}>
						<SidebarItem link={link} onLinkClick={props.onLinkClick} />
					</li>
				))}
			</ul>
		</div>
	);
}

function SidebarItem(props: { link: SidebarLink; onLinkClick?: () => void }) {
	const pathname = usePathname();
	const isActive = pathname === props.link.href;

	const { link } = props;
	if ("links" in link) {
		return (
			<DocSidebarCategory
				key={link.name}
				linkGroup={link}
				onLinkClick={props.onLinkClick}
			/>
		);
	} else {
		return (
			<Link
				href={link.href}
				onClick={props.onLinkClick}
				className={clsx(
					"block overflow-hidden text-ellipsis py-2 text-base transition-colors duration-300 hover:text-f-100",
					isActive ? "font-semibold text-accent-500" : "text-f-300",
				)}
			>
				{link.name}
			</Link>
		);
	}
}

function DocSidebarCategory(props: {
	linkGroup: LinkGroup;
	onLinkClick?: () => void;
}) {
	const pathname = usePathname();
	const { href, isCollapsible, name, links, expanded, icon } = props.linkGroup;
	const isCategoryActive = href && href === pathname;

	if (isCollapsible === false) {
		return (
			<div className="my-4">
				<div className="mb-2 flex items-center gap-2">
					{icon && <SidebarIcon icon={icon} />}
					{href ? (
						<Link
							className={cn(
								"block text-base font-semibold text-f-100 hover:text-accent-500",
								isCategoryActive && "!text-accent-500",
							)}
							href={href}
						>
							{name}
						</Link>
					) : (
						<div className="text-base font-semibold">{name}</div>
					)}
				</div>

				<ul className="flex flex-col">
					{links.map((link) => {
						return (
							<li key={link.name + link.href}>
								<SidebarItem link={link} onLinkClick={props.onLinkClick} />
							</li>
						);
					})}
				</ul>
			</div>
		);
	}

	const hasActiveHref = containsActiveHref(
		{
			name: name,
			links: links,
			href: href,
		},
		pathname,
	);

	const trigger = (
		<AccordionTrigger
			className={cn(
				"py-2 text-base",
				isCategoryActive && "!font-semibold !text-accent-500",
				"text-f-300 hover:text-f-100",
			)}
		>
			<div className="flex gap-2">
				{icon && <SidebarIcon icon={icon} />}
				{name}
			</div>
		</AccordionTrigger>
	);

	return (
		<Accordion
			collapsible
			type="single"
			defaultValue={expanded || hasActiveHref ? "x" : undefined}
		>
			<AccordionItem value="x" className="border-none">
				{href ? (
					<Link href={href} className={cn("block w-full text-left")}>
						{trigger}
					</Link>
				) : (
					trigger
				)}

				<AccordionContent>
					<ul className="flex flex-col border-l-2 pl-4">
						{links.map((link) => {
							return (
								<li key={link.name + link.href}>
									<SidebarItem link={link} onLinkClick={props.onLinkClick} />
								</li>
							);
						})}
					</ul>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

export function DocSidebarMobile(props: ReferenceSideBarProps) {
	const [open, _setOpen] = useState(false);

	const setOpen = (value: boolean) => {
		if (value) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		_setOpen(value);
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button className="w-full justify-between border bg-b-800 py-4 text-left text-f-100 xl:hidden">
					{props.name}
					<ChevronDown
						className={clsx(
							"h-5 w-5 text-f-300 transition-transform",
							open && "rotate-180",
						)}
					/>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent asChild sideOffset={10} align="center" side="bottom">
				<div className="max-h-[70vh] w-[calc(100vw-32px)] overflow-y-auto rounded-lg border bg-b-800 px-4">
					<DocSidebar
						{...props}
						onLinkClick={() => {
							setOpen(false);
							if (props.onLinkClick) {
								props.onLinkClick();
							}
						}}
					/>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function containsActiveHref(
	sidebarlink: SidebarLink,
	activeLink: string,
): boolean {
	if (sidebarlink.href === activeLink) {
		return true;
	}
	if ("links" in sidebarlink) {
		return sidebarlink.links.some((link) =>
			containsActiveHref(link, activeLink),
		);
	}
	return false;
}

function SidebarIcon(props: { icon: StaticImport | React.ReactElement }) {
	if (isStaticImport(props.icon)) {
		return <Image src={props.icon} alt="" className="h-5 w-5" />;
	}
	return <div className="[&>*]:h-5 [&>*]:w-5">{props.icon}</div>;
}
