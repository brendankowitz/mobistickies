using System;
using System.ComponentModel;
using System.Runtime.Serialization;
using System.Windows;
using Microsoft.Phone.Controls;
using Microsoft.Phone.Shell;
using WPCordovaClassLib.Cordova.JSON;

namespace WPCordovaClassLib.Cordova.Commands
{
    [DataContract]
    public class AppBarButton
    {
        [DataMember]
        public string title { get; set; }
        [DataMember]
        public string icon { get; set; }
    }

    public class NativeAppBarCommand : BaseCommand
    {
        private bool _canGoBack = true;
        private string menuCallback;
        private string backButtonCallback;
        private bool backButtonEvent;

        public PhoneApplicationPage Page
        {
            get
            {
                var frame = Application.Current.RootVisual as PhoneApplicationFrame;
                if (frame != null)
                {
                    return frame.Content as PhoneApplicationPage;
                }
                return null;
            }
        }

        private void PageOnBackKeyPress(object sender, CancelEventArgs cancelEventArgs)
        {
            if (_canGoBack == false)
            {
                var result = new PluginResult(PluginResult.Status.OK);
                result.KeepCallback = true;
                DispatchCommandResult(result, backButtonCallback);

                cancelEventArgs.Cancel = true;
            }
        }

        public void CreateButton(string command)
        {
            var paramList = JsonHelper.Deserialize<string[]>(command);

            menuCallback = paramList[1];
            var button = JsonHelper.Deserialize<AppBarButton>(paramList[0]);
            EnableAppBar();
            Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    var item =
                        new ApplicationBarIconButton(new Uri(button.icon,
                                                            UriKind.Relative));
                    item.Text = button.title;
                    item.Click += ItemOnClick;
                    Page.ApplicationBar.Buttons.Add(item);
                });
        }

        public void CreateMenuItem(string command)
        {
            var paramList = JsonHelper.Deserialize<string[]>(command);

            menuCallback = paramList[1];
            var button = JsonHelper.Deserialize<AppBarButton>(paramList[0]);
            EnableAppBar();

            Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    var item = new ApplicationBarMenuItem(button.title);
                    item.Click += ItemOnClick;
                    Page.ApplicationBar.MenuItems.Add(item);
                });
        }

        public void CaptureBackButton(string command)
        {
            var paramList = JsonHelper.Deserialize<string[]>(command);

            backButtonCallback = paramList[1];
            if (paramList[0].EndsWith("true"))
                _canGoBack = false;
            else if (paramList[0].EndsWith("false"))
                _canGoBack = true;

            if (!backButtonEvent)
            {
                Deployment.Current.Dispatcher.BeginInvoke(() => Page.BackKeyPress += PageOnBackKeyPress);
                backButtonEvent = true;
            }
        }

        private void ItemOnClick(object sender, EventArgs eventArgs)
        {
            var item = sender as ApplicationBarMenuItem;
            if (item != null)
            {
                var result = new PluginResult(PluginResult.Status.OK, item.Text);
                result.KeepCallback = true;
                DispatchCommandResult(result, menuCallback);
                return;
            }
            var button = sender as ApplicationBarIconButton;
            if (button != null)
            {
                var result = new PluginResult(PluginResult.Status.OK, button.Text);
                result.KeepCallback = true;
                DispatchCommandResult(result, menuCallback);
            }
        }

        private void EnableAppBar()
        {
            Deployment.Current.Dispatcher.BeginInvoke(() =>
                {
                    if (Page.ApplicationBar == null)
                        Page.ApplicationBar = new ApplicationBar();

                    Page.ApplicationBar.IsMenuEnabled = true;
                    Page.ApplicationBar.IsVisible = true;
                    Page.ApplicationBar.Mode = ApplicationBarMode.Minimized;
                });
        }
    }
}