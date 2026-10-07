import React from "react";

export default function Link({ href, children, ...props }) {
  const handleClick = (e) => {
    if (props.onClick) props.onClick(e);
    if (!e.defaultPrevented && href && !href.startsWith("http") && !href.startsWith("#") && !href.startsWith("mailto:")) {
      e.preventDefault();
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
