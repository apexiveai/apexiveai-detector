"use client";

import { ReactNode, useEffect, useState } from "react";
import "./ProductAccessGate";

type ProductAccessGateProps = {

  productKey: string;

  children: ReactNode;

  productName?: string;

  subscriptionPath?: string;

};

type AccessResponse = {

  allowed: boolean;

  product_key?: string;

  plan_code?: string | null;

  plan_name?: string | null;

  status?: string | null;

  starts_at?: string | null;

  ends_at?: string | null;

  reason?: string | null;

};

function getToken() {

  if (typeof window === "undefined") return "";

  return (

    localStorage.getItem("apexive_token") ||

    sessionStorage.getItem("apexive_token") ||

    ""

  );

}

export default function ProductAccessGate({

  productKey,

  children,

  productName = "Product",

  subscriptionPath = "/subscription",

}: ProductAccessGateProps) {

  const [loading, setLoading] = useState(true);

  const [access, setAccess] =

    useState<AccessResponse | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {

    let cancelled = false;

    const checkAccess = async () => {

      const token = getToken();

      if (!token) {

        window.location.href = "/login";

        return;

      }

      try {

        const response = await fetch(

          `http://127.0.0.1:8000/api/subscriptions/access/${encodeURIComponent(

            productKey

          )}`,

          {

            method: "GET",

            headers: {

              Authorization: `Bearer ${token}`,

            },

            cache: "no-store",

          }

        );

        if (response.status === 401) {

          localStorage.removeItem("apexive_token");

          sessionStorage.removeItem("apexive_token");

          window.location.href = "/login";

          return;

        }

        if (!response.ok) {

          throw new Error(

            "Product access service is unavailable."

          );

        }

        const result =

          (await response.json()) as AccessResponse;

        if (!cancelled) {

          setAccess(result);

        }

      } catch (err) {

        if (!cancelled) {

          setError(

            err instanceof Error

              ? err.message

              : "Unable to verify product access."

          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    };

    checkAccess();

    return () => {

      cancelled = true;

    };

  }, [productKey]);

  if (loading) {

    return (

      <div className="product-gate-loading">

        <div className="product-gate-spinner" />

        <span>VERIFYING PRODUCT ACCESS...</span>

      </div>

    );

  }

  if (error) {

    return (

      <div className="product-gate-blocked">

        <span className="product-gate-code">

          ACCESS VERIFICATION ERROR

        </span>

        <h2>Unable to verify access</h2>

        <p>{error}</p>

        <button

          type="button"

          onClick={() => window.location.reload()}

        >

          RETRY

        </button>

      </div>

    );

  }

  if (!access?.allowed) {

    return (

      <div className="product-gate-blocked">

        <span className="product-gate-code">

          PRODUCT ACCESS LOCKED

        </span>

        <h2>{productName}</h2>

        <p>

          This product is available only to accounts

          with an approved and active subscription.

        </p>

        {access?.reason && (

          <small>{access.reason}</small>

        )}

        <div className="product-gate-actions">

          <button

            type="button"

            onClick={() =>

              (window.location.href = subscriptionPath)

            }

          >

            VIEW SUBSCRIPTION

          </button>

          <button

            type="button"

            className="secondary"

            onClick={() =>

              (window.location.href =

                "/account/history")

            }

          >

            VIEW ACCOUNT HISTORY

          </button>

        </div>

      </div>

    );

  }
  return <>{children}</>;

}