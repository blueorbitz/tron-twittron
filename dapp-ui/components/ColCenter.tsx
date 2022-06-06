import React from "react";

export default function ColCenter({ children }: any) {
  return (
    <React.Fragment>
      <div className="col-2" />
      <div className="col-8">
        {children}
      </div>
      <div className="col-2" />
    </React.Fragment>
  )
}
