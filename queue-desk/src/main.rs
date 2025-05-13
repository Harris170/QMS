use dioxus::prelude::*;

#[derive(Debug, Clone, Routable, PartialEq)]
#[rustfmt::skip]
enum Route {
    #[layout(Sidebar)]
    #[route("/")]
    Home {},
    #[route("/queues")]
    Queues {},
}
fn main() {
    dioxus::launch(App);
}

const FAVICON: Asset = asset!("/assets/favicon.ico");
const MAIN_CSS: Asset = asset!("/assets/main.css");

#[component]
fn App() -> Element {
    rsx!(
        document::Link { rel: "icon", href: FAVICON }
        document::Link { rel: "stylesheet", href: MAIN_CSS }

        Router::<Route> {}
    )
}

#[component]
fn Sidebar() -> Element {
    rsx! {
        div { class: "layout-container",
            aside {
                class: "sidebar",
                div { class: "nav-links",
                    Link { to: Route::Home {},  "Home" }
                    Link { to: Route::Queues {},  "Queues"}
                }
            }
            main {
                class: "main-content",
                Outlet::<Route> {}
            }
        }
    }
}

#[component]
fn Home() -> Element {
    rsx! {
            h1 { "QueueDesk" }
            p { "IoT-powered queue management" }
            Link {
                to: Route::Queues {},
                "View Queues"
            }
    }
}

#[component]
fn Queues() -> Element {
    rsx! {
            h1 { "Queues" }
            p { "This is where you’ll see and manage all active queues." }
    }
}

#[component]
fn NotFound() -> Element {
    rsx! {
        div { class: "not-found",
            h1 { "404" }
            p { "Page not found." }
            Link { to: Route::Home {}, "← Return Home" }
        }
    }
}
